# WebR Proxy

Simple container with SOCKS proxy server running behind sockify, to connect from WebAssembly.


## Test with a public proxy server

Open the WebR test app on https://webr.r-wasm.org/latest/ run some code to test:


```r
# This routes all traffic over a public proxy server!
Sys.setenv(ALL_PROXY="socks5h://test:yolo@ws.opencpu.org:443")

install.packages("curl")
library(curl)

example(curl_fetch_memory)
```

The `ALL_PROXY` variable will make libcurl route all traffic via this proxy server.

The server `ws.opencpu.org` is running exactly the same service from this container, but behind cloudflare to get improved routing and proper https certificates.


## Test with a local proxy server

On your local machine start the proxy server with:

```sh
docker run -it -p7777:7777 ghcr.io/r-wasm/ws-proxy
```

Now open the WebR test app on https://webr.r-wasm.org/latest/ run this code to test:

```r
# Need to use non-https ws:// for local testing
webr::eval_js("SOCKFS.websocketArgs.url = 'ws://'")
Sys.setenv(ALL_PROXY="socks5h://test:yolo@localhost:7777")

install.packages("curl")
library(curl)

example(curl_fetch_memory)
```

You should be able to see the proxy traffic in the docker terminal session.

NB the first line is needed because the your local proxy server does not have properly signed https certificates by default. Hence we connect over a HTTP instead of HTTPS websocket.

