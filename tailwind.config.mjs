// We use this environment variable provided by hugo as a workaround for `css.TailwindCSS`
// (https://gohugo.io/functions/css/tailwindcss/) not supporting the `--config` option. It's
// important that this file be named anything that will be automatically recognized by tailwindcss,
// other than `tailwind.config.js`.

// An interesting side-effect of this is that consumers of this theme will be able to override the
// configuration without vendoring, which is actually pretty cool!
module.exports = require(process.env.HUGO_FILE_TAILWIND_CONFIG_JS);
