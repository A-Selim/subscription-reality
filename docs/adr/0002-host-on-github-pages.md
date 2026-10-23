# Host on GitHub Pages

Host the app on GitHub Pages at `https://a-selim.github.io/subscription-reality/`, deployed by GitHub Actions on every push to `main` or by hand. LinkedIn flags the shared `pages.dev` domain as suspicious. GitHub Pages is free, uses a trusted domain and sits next to the repo.

GitHub Pages cannot set custom response headers. The build's `autoCsp` meta tag and HTTPS still protect the app, but the extra security headers are lost. The page can be framed. A custom domain with a host or proxy that supports custom headers is the way to restore them if needed.

Every project on `a-selim.github.io` shares one origin, so another project under that account can read this app's IndexedDB. Data at the old `subscription-reality.pages.dev` address stays there and does not carry over. The site lives under `/subscription-reality/`, so the deploy workflow sets that base href. Local builds and the dev server keep serving from `/`.
