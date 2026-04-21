import { WebR } from 'webr';

const webR = new WebR({});

async function run_test(){
  await webR.init();
  await webR.evalR(`webr::install("curl")`);
  await webR.evalR(`h <- curl::new_handle(connecttimeout = 1, noproxy = '*')
    req <- curl::curl_fetch_memory("http://get-ws-proxy.r-universe.dev:443", handle = h)
    print(rawToChar(req$content))`);
  await webR.close();
}

run_test()

