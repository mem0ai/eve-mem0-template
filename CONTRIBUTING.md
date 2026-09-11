# Contributing

Thanks for taking the time to contribute! This repo is the **Mem0 eve template**:
a small, deployable starting point for an [eve](https://eve.dev) agent with
long-term memory powered by [Mem0](https://mem0.ai).

## Two ways to use this repo

- **Building your own agent?** You don't need to contribute here. Click Deploy
  (or fork the repo) and edit your copy freely. It's yours from that point on.
- **Improving the template itself?** That's what this guide is for: bug fixes,
  clearer docs, and small improvements that help everyone who starts from it.

## Before you open a pull request

Open an issue first so we can agree on the change before you spend time on it.
This avoids duplicate work and keeps the template small and focused on showing
Mem0 + eve clearly. Small fixes (typos, broken links, a failing command) can go
straight to a PR.

A good bug report has: what you ran, what you expected, what actually happened
(with the real error text), and the versions of `eve` and `mem0ai` you were on.

## Developing locally

```bash
npm install
cp .env.example .env      # add MEM0_API_KEY and model access (AI_GATEWAY_API_KEY)
npm run dev               # eve development REPL
```

Before opening a PR, make sure it still builds and typechecks:

```bash
npm run typecheck
npm run build
```

Keep the Mem0 wiring simple. The template is meant to be read start to finish in
a few minutes, so prefer a clear example over a complete one.

## Community and conduct

Be respectful and constructive. This project follows the Mem0
[Code of Conduct](https://github.com/mem0ai/mem0/blob/main/CODE_OF_CONDUCT.md).
Questions and ideas are welcome in the Mem0 [Discord](https://mem0.dev/DiG).

## License

By contributing, you agree that your contributions are licensed under the
[Apache-2.0 License](./LICENSE), the same license as this repo.
