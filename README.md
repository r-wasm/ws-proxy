# WS Proxy

Simple container with SOCKS5 proxy running behind sockify to connect from WebAssembly.

For more details read the blog post [Making libcurl work in webassembly](https://jeroen.github.io/notes/webassembly-curl/).


## Minimal example with a public proxy server

Open the [WebR test app](https://webr.r-wasm.org/latest/) run some code to test. Note how the `ALL_PROXY` variable is all that is needed to make libcurl route all traffic via the proxy server.

```r
# Install packages
install.packages("curl")

# Make a request via the public server server!
Sys.setenv(ALL_PROXY="socks5h://test:yolo@ws.r-universe.dev:443")
req <- curl::curl_fetch_memory('https://hb.cran.dev/get')
cat(rawToChar(req$content))
```

The server `ws.r-universe.dev` is running exactly the same service from this container, but behind cloudflare to improve routing and handle the HTTPS certificates.

## Testing many requests in parallel

The following code downloads an PACKAGES index file from CRAN, and then 200 small text files in parallel over HTTP/2 with verbosity turned on.

```r
# Install the R package
install.packages('curl')

# Set the ws-proxy server
Sys.setenv(ALL_PROXY='socks5h://test:yolo@ws.r-universe.dev:443')

# From here everything is normal R code:
df <- read.dcf(curl::curl('https://cran.rstudio.com/src/contrib/PACKAGES'))
pkgs <- df[1:200, 'Package']
urls <- sprintf('https://cran.rstudio.com/web/packages/%s/DESCRIPTION', pkgs)
destfiles <- sprintf('~/%s.txt', pkgs)
results <- curl::multi_download(urls, destfiles, verbose = TRUE)
all(results$status == 200)

# Read one of the files to show it is there
list.files('~')
readLines("~/abc.txt")
```

If you run this in the [WebR test app](https://webr.r-wasm.org/latest/) you can also view the file in the WebUI under `/home/web_user`.

## Test a local proxy server

On your local machine start the proxy server with:

```sh
docker run -it -p7777:7777 ghcr.io/r-wasm/ws-proxy
```

Now open the [WebR test app](https://webr.r-wasm.org/latest/) and run:

```r
# Need to use non-https ws:// for local testing!
webr::eval_js("SOCKFS.websocketArgs.url = 'ws://'")

# Same as before, but with localhost
Sys.setenv(ALL_PROXY="socks5h://test:yolo@localhost:7777")
install.packages("curl")
req <- curl::curl_fetch_memory('https://hb.cran.dev/get')
cat(rawToChar(req$content))
```

You should be able to see the proxy traffic in the docker terminal session.

NB: the first line is needed because the your local proxy server does not have properly signed https certificates by default. Hence we proxy using a HTTP instead of HTTPS websocket.
