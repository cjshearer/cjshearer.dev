/* TODO: see caching behavior for GetRemote so we can fetch this during nix build  */
import "https://unpkg.com/pagedjs@0.4.3/dist/paged.min.js";

const PRINT_PARAM = "print";

function inPrintMode() {
  return new URL(window.location.href).searchParams.has(PRINT_PARAM);
}

function toPrintUrl() {
  const url = new URL(window.location.href);
  url.searchParams.set(PRINT_PARAM, "true");
  return url;
}

function toScreenUrl() {
  const url = new URL(window.location.href);
  url.searchParams.delete(PRINT_PARAM);
  return url;
}

async function initializePagedJS() {
  const previewer = new PagedModule.Previewer();
  await previewer.preview();
}

window.onafterprint = () => {
  window.location.replace(toScreenUrl().href);
};

if (inPrintMode()) {
  await initializePagedJS();
  window.print();
} else {
  window.onbeforeprint = () => {
    window.location.replace(toPrintUrl().href);
  };
}
