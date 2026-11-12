import io
import json
import os
import unittest
from unittest.mock import patch

import app as server


class ImageProviderTests(unittest.TestCase):
    image = "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mP8/x8AAwMCAO+aXZkAAAAASUVORK5CYII="

    def setUp(self):
        self.client = server.app.test_client()
        self.enterContext(patch.dict(os.environ, OPENAI_API_KEY="", AGNES_API_KEY=""))
        self.enterContext(patch.object(server, "_generation_times", {}))
        self.send = self.enterContext(patch.object(server.urllib.request, "urlopen"))
        self.send.return_value = io.BytesIO(json.dumps({"data": [{"b64_json": self.image.split(",")[1]}]}).encode())

    def generate(self, **options):
        return self.client.post("/api/generate-image", json={"image": self.image, "prompt": "watercolor", **options})

    def test_openai_edits_original_when_both_keys_exist(self):
        os.environ.update(OPENAI_API_KEY="open-test-secret", AGNES_API_KEY="old-test-secret")
        self.assertEqual(self.client.get("/api/generate-image/status").json, {"provider": "OpenAI", "configured": True})
        html = self.client.get("/").get_data(as_text=True)
        self.assertIn("gpt-image-2.5-flare", html)
        self.assertNotIn("open-test-secret", html)
        response = self.generate()
        self.assertEqual(response.status_code, 200)
        self.assertEqual(response.json["data"][0]["b64_json"], self.image.split(",")[1])
        req = self.send.call_args.args[0]
        self.assertEqual(req.full_url, "https://api.openai.com/v1/images/edits")
        self.assertEqual(req.get_header("Authorization"), "Bearer open-test-secret")
        self.assertEqual(json.loads(req.data), {
            "model": "gpt-image-2.5-flare", "images": [{"image_url": self.image}],
            "prompt": "watercolor", "size": "1024x768", "quality": "medium", "n": 1, "output_format": "png",
        })
        self.assertEqual(self.generate().status_code, 429)
        self.send.assert_called_once()

    def test_agnes_only_keeps_existing_contract(self):
        os.environ["AGNES_API_KEY"] = "old-test-secret"
        self.assertIn("agnes-image-2.0-flash", self.client.get("/").get_data(as_text=True))
        self.assertEqual(self.generate(model="agnes-image-2.0-flash").status_code, 200)
        req = self.send.call_args.args[0]
        self.assertEqual(req.full_url, server.AGNES_IMAGE_ENDPOINT)
        self.assertEqual(json.loads(req.data)["extra_body"], {"image": [self.image], "response_format": "b64_json"})

    def test_missing_key_and_invalid_requests_do_not_call_provider(self):
        self.assertFalse(self.client.get("/api/generate-image/status").json["configured"])
        self.assertEqual(self.generate().status_code, 503)
        os.environ["OPENAI_API_KEY"] = "open-test-secret"
        self.assertEqual(self.generate(model="agnes-image-2.0-flash").status_code, 400)
        self.assertEqual(self.generate(image="invalid").status_code, 400)
        self.send.assert_not_called()
