"""Decode the project's non-interlaced, 8-bit RGBA shape PNGs using stdlib only."""
from pathlib import Path
import struct
import re
import zlib


def inspect_shape_png(path, expected_size=None):
    """Reject corrupt, blank, opaque or wrongly sized isolated road exports."""
    path = Path(path)
    data = path.read_bytes()
    if data[:8] != b'\x89PNG\r\n\x1a\n':
        raise ValueError(f'{path}: missing PNG signature')
    offset = 8
    header = None
    compressed = bytearray()
    ended = False
    idat_closed = False
    while offset < len(data):
        if offset + 12 > len(data):
            raise ValueError(f'{path}: truncated chunk')
        length, kind = struct.unpack_from('>I4s', data, offset)
        stop = offset + 12 + length
        if stop > len(data):
            raise ValueError(f'{path}: truncated {kind!r}')
        payload = data[offset + 8:stop - 4]
        crc = struct.unpack_from('>I', data, stop - 4)[0]
        if zlib.crc32(kind + payload) & 0xffffffff != crc:
            raise ValueError(f'{path}: broken {kind.decode("ascii", "replace")} checksum')
        if header is None and kind != b'IHDR':
            raise ValueError(f'{path}: IHDR must be first')
        if kind == b'IHDR':
            if header is not None or length != 13:
                raise ValueError(f'{path}: invalid IHDR')
            header = struct.unpack('>IIBBBBB', payload)
            width, height, depth, color, compression, filtering, interlace = header
            if not (0 < width <= 2400 and 0 < height <= 2400):
                raise ValueError(f'{path}: invalid shape dimensions')
            if (depth, color, compression, filtering, interlace) != (8, 6, 0, 0, 0):
                raise ValueError(f'{path}: expected non-interlaced 8-bit RGBA')
            if max(width, height) != 2400:
                raise ValueError(f'{path}: longest edge must be 2400 pixels')
            if expected_size is not None and (width, height) != tuple(expected_size):
                raise ValueError(f'{path}: dimensions differ from Shape_Index.csv')
        elif kind == b'IDAT':
            if idat_closed:
                raise ValueError(f'{path}: nonconsecutive IDAT chunks')
            compressed.extend(payload)
        elif kind == b'IEND':
            if length or stop != len(data) or not compressed:
                raise ValueError(f'{path}: invalid IEND or missing image data')
            ended = True
            break
        else:
            if compressed:
                idat_closed = True
            if not kind[0] & 32 and kind != b'PLTE':
                raise ValueError(f'{path}: unsupported critical chunk {kind!r}')
        offset = stop
    if not ended:
        raise ValueError(f'{path}: missing IEND')
    stride = width * 4
    expected_bytes = (stride + 1) * height
    decoder = zlib.decompressobj()
    try:
        raw = decoder.decompress(compressed, expected_bytes + 1)
    except zlib.error as error:
        raise ValueError(f'{path}: invalid compressed pixels: {error}') from error
    if (len(raw) != expected_bytes or not decoder.eof
            or decoder.unused_data or decoder.unconsumed_tail):
        raise ValueError(f'{path}: incomplete or excess pixel data')
    previous = bytearray(width)
    visible = transparent = 0
    bounds = [width, height, -1, -1]
    for y in range(height):
        start = y * (stride + 1)
        filter_type = raw[start]
        if filter_type > 4:
            raise ValueError(f'{path}: invalid scanline filter {filter_type}')
        encoded = raw[start + 4:start + stride + 1:4]
        # RGB values do not affect alpha reconstruction: PNG filters use the
        # corresponding channel of the previous pixel/row (four bytes apart).
        if filter_type == 0:
            row = bytearray(encoded)
        elif filter_type == 2:
            row = previous.copy()
            # Most Up-filtered rows change only a few alpha bytes. Locate them
            # in C rather than visiting every transparent pixel in Python.
            for match in re.finditer(b'[^\x00]', encoded):
                i = match.start()
                row[i] = (encoded[i] + previous[i]) & 255
        else:
            row = bytearray(encoded)
        for i in range(width) if filter_type in (1, 3, 4) else ():
            left = row[i - 1] if i else 0
            above = previous[i]
            upper_left = previous[i - 1] if i else 0
            if filter_type == 1:
                predictor = left
            elif filter_type == 3:
                predictor = (left + above) // 2
            elif filter_type == 4:
                estimate = left + above - upper_left
                distances = (abs(estimate - left), abs(estimate - above), abs(estimate - upper_left))
                predictor = (left, above, upper_left)[distances.index(min(distances))]
            else:
                predictor = 0
            row[i] = (row[i] + predictor) & 255
        zeros = row.count(0)
        transparent += zeros
        visible += width - zeros
        if zeros != width:
            bounds[0] = min(bounds[0], width - len(row.lstrip(b'\0')))
            bounds[1] = min(bounds[1], y)
            bounds[2] = max(bounds[2], len(row.rstrip(b'\0')) - 1)
            bounds[3] = max(bounds[3], y)
        previous = row
    if not visible or not transparent:
        raise ValueError(f'{path}: expected a visible road on a transparent background')
    if bounds[0] == 0 or bounds[1] == 0 or bounds[2] == width - 1 or bounds[3] == height - 1:
        raise ValueError(f'{path}: drawing touches the canvas edge')
    return {'width': width, 'height': height, 'visible_pixels': visible,
            'transparent_pixels': transparent, 'alpha_bounds': bounds}
