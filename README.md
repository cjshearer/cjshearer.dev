# cjshearer.dev

My resume site, built with [modern-hugo-resume](https://github.com/cjshearer/modern-hugo-resume) - A responsive, minimal, print-friendly resume builder. Powered by Hugo, Tailwind CSS, Nix, and GitHub Pages.

## Local Development

### Requirements

These can be installed manually, or automatically with [nix](https://nixos.org/download/) by running `nix develop`:

1. Install [`hugo`](https://gohugo.io/installation/) v0.135.0+extended.
2. Install [`go`](https://go.dev/dl/) v1.22.7.

### Common Commands
```sh
nix develop     # open a development environment, with all requirements satisfied
nix build       # build the production site, exactly the same way it's done in CI
nix flake check # run formatter/linter checks, exactly the same way it's done in CI

hugo server     # serve to localhost and rebuild changes automatically
hugo --minify   # build static site for production
```
