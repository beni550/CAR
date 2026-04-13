# Image Testing Playbook

## TEST AGENT PROMPT – IMAGE INTEGRATION RULES
Follow these rules exactly for testing AI image recognition.

### Image Handling Rules
- Always use base64-encoded images for all tests and requests.
- Accepted formats: JPEG, PNG, WEBP only.
- Do not use SVG, BMP, HEIC, or other formats.
- Do not upload blank, solid-color, or uniform-variance images.
- Every image must contain real visual features.
- If the image is not PNG/JPEG/WEBP, transcode it first.
