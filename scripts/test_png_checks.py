"""Regression cases for media corruption that valid hashes alone cannot catch."""
from pathlib import Path
import struct
import tempfile
import unittest
import zlib
from png_checks import inspect_shape_png


def chunk(kind, data):
    return struct.pack('>I', len(data)) + kind + data + struct.pack('>I', zlib.crc32(kind + data) & 0xffffffff)


def png(rows, filter_type=0, **changes):
    width, height = 3, 2400
    previous = [0] * width
    raw = bytearray()
    for alpha in rows:
        raw.append(filter_type)
        for x, value in enumerate(alpha):
            left = alpha[x - 1] if x else 0
            above = previous[x]
            upper_left = previous[x - 1] if x else 0
            if filter_type == 4:
                prediction = left + above - upper_left
                distances = [abs(prediction - v) for v in (left, above, upper_left)]
                predictor = (left, above, upper_left)[distances.index(min(distances))]
            else:
                predictor = [0, left, above, (left + above) // 2, 0][filter_type]
            raw.extend((0, 0, 0, (value - predictor) & 255))
        previous = alpha
    if changes.get('bad_filter'):
        raw[0] = 5
    image = zlib.compress(raw)
    if changes.get('truncated_pixels'):
        image = image[:-2]
    if changes.get('extra_pixels'):
        image = zlib.compress(raw + b'\0')
    return (b'\x89PNG\r\n\x1a\n' + chunk(b'IHDR', struct.pack('>IIBBBBB', width, height, 8, 6, 0, 0, 0))
            + chunk(b'IDAT', image) + chunk(b'IEND', b''))


class ShapePngTests(unittest.TestCase):
    def setUp(self):
        self.directory = tempfile.TemporaryDirectory()
        self.addCleanup(self.directory.cleanup)
        self.path = Path(self.directory.name) / 'shape.png'
        self.rows = [[0, 0, 0] for _ in range(2400)]
        self.rows[100:103] = [[0, 255, 0], [0, 127, 0], [0, 64, 0]]

    def inspect(self, data, size=(3, 2400)):
        self.path.write_bytes(data)
        return inspect_shape_png(self.path, size)

    def test_all_five_scanline_filters_reconstruct_alpha(self):
        for filtering in range(5):
            with self.subTest(filtering=filtering):
                result = self.inspect(png(self.rows, filtering))
                self.assertEqual(result['visible_pixels'], 3)
                self.assertEqual(result['alpha_bounds'], [1, 100, 1, 102])

    def test_empty_and_corrupt_checksum(self):
        data = bytearray(png(self.rows))
        data[-5] ^= 1
        for invalid in (b'', data):
            with self.assertRaises(ValueError):
                self.inspect(invalid)

    def test_truncation_and_invalid_pixel_stream(self):
        valid = png(self.rows)
        for invalid in (valid[:-1], valid + b'extra', png(self.rows, truncated_pixels=True),
                        png(self.rows, extra_pixels=True), png(self.rows, bad_filter=True)):
            with self.assertRaises(ValueError):
                self.inspect(invalid)

    def test_blank_opaque_clipped_and_wrong_dimensions(self):
        for rows in ([[0, 0, 0]] * 2400, [[255, 255, 255]] * 2400,
                     [[0, 255, 0]] + [[0, 0, 0]] * 2399):
            with self.assertRaises(ValueError):
                self.inspect(png(rows))
        with self.assertRaises(ValueError):
            self.inspect(png(self.rows), (4, 2400))


if __name__ == '__main__':
    unittest.main()
