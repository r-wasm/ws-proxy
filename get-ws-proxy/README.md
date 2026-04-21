# get-ws-proxy

This is a tiny helper utility that runs as a cloudflare worker on e.g. https://get-ws-proxy.r-universe.dev. It implements a mini websockify in order to respond to a simple HTTP request that is made via emscripten [emulated POSIX TCP sockets over webSockets](https://emscripten.org/docs/porting/networking.html#emulated-posix-tcp-sockets-over-websockets). 

We use this as a bootstrap mechanism to advertise our proxy server URL, so that we do not need to hardcode this it in the client. In WebR you can do this to connect to the server without any proxy:

```r
install.packages('curl')
h <- curl::new_handle(connecttimeout = 1, noproxy = '*') #ignore ALL_PROXY envvar
req <- curl::curl_fetch_memory("http://get-ws-proxy.r-universe.dev:443", handle = h)
rawToChar(req$content)
```

Test this locally:

```
npm run dev
```

And then in your local WebR we need to override it to use a non-https websocket:

```r
install.packages('curl')
webr::eval_js("SOCKFS.websocketArgs.url = 'ws://'")
h <- curl::new_handle(verbose = T, connecttimeout = 1, noproxy = '*')
req <- curl::curl_fetch_memory("http://localhost:8787/", handle = h)
cat(rawToChar(req$content))
```

## Deployment info

To deploy we run

```
npm run dev
```


