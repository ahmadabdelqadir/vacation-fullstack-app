# Seed Images

Real travel photos fetched from [Unsplash](https://unsplash.com). All images
are free to use under the [Unsplash License](https://unsplash.com/license).
Resolution: 1600px wide, JPEG, progressive.

| File | Destination | Subject |
|---|---|---|
| `vacation-01.jpg` | Paris, France | Eiffel Tower |
| `vacation-02.jpg` | Rome, Italy | Colosseum |
| `vacation-03.jpg` | Cairo, Egypt | Pyramids of Giza |
| `vacation-04.jpg` | Barcelona, Spain | Sagrada Família |
| `vacation-05.jpg` | Tokyo, Japan | City lights |
| `vacation-06.jpg` | Rio de Janeiro, Brazil | Christ the Redeemer |
| `vacation-07.jpg` | Lisbon, Portugal | Classic yellow tram |
| `vacation-08.jpg` | Reykjavik, Iceland | Icelandic landscape |
| `vacation-09.jpg` | Cape Town, South Africa | Table Mountain |
| `vacation-10.jpg` | Bali, Indonesia | Rice terraces |
| `vacation-11.jpg` | New York, USA | Manhattan skyline |
| `vacation-12.jpg` | Santorini, Greece | Blue-domed churches |
| `vacation-13.jpg` | Sydney, Australia | Opera House |
| `vacation-14.jpg` | Marrakech, Morocco | Medina / souks |
| `vacation-15.jpg` | Kyoto, Japan | Vermilion torii gates |
| `vacation-16.jpg` | Dubrovnik, Croatia | Old Town walls |
| `vacation-17.jpg` | Maldives | Overwater bungalows |
| `vacation-18.jpg` | Banff, Canada | Moraine Lake |

## How these are used

- The seeder in `Backend/src/2-utils/seeder.ts` copies these files into
  `Backend/src/1-assets/images/` on first boot (the runtime-served directory).
- Each vacation document stores only the filename (e.g. `vacation-01.jpg`)
  in MongoDB; the actual bytes live on disk.
- The public endpoint `GET /api/vacations/images/:imageName` serves them via
  `uploaded-file-saver`.

## Refreshing

To refresh these images without changing filenames (so the DB keeps working),
overwrite the files here and restart the backend. The seeder will re-copy any
missing files to the runtime dir on next boot. If the runtime dir already has
the same filenames, delete those first to force a re-copy:

```bash
rm Backend/src/1-assets/images/vacation-*.jpg
npm --prefix Backend start
```
