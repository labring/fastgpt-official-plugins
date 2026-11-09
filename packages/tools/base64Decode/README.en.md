# base64Decode

Enter a Base64-encoded string and get a text, image, etc.

Each child tool accepts an optional `fileName` input. `toFile` and `toImage`
use it as the uploaded file name; `toText` keeps returning decoded text and,
when `fileName` is provided, also uploads a UTF-8 text file and returns its URL.
Names without an extension receive the detected extension automatically.
