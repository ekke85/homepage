## Homepage widget for Dispatcharr:
Please note this widget is not an official widget and is not supported by the Dispatcharr or Homepage teams. This is very much a DIY widget and is based on the documentation from Homepage and the API documentation from Dispatcharr.

## Install

In Homepage root directory add the files as below:

```
`-- src
    |-- utils
    |   `-- proxy
    |       `-- handlers
    |           `-- dispatcharr.js
    `-- widgets
        `-- dispatcharr
            |-- component.js
            `-- widget.js
```

### Register Dispatcharr widget in Homepage:

- `src/widgets/widgets.js`
In alphabetical order add:<br />
```
import dispatcharr from "./dispatcharr/widget";
```

and in **const widgets = {** below **diskstation** again:
```
dispatcharr,
```


- `src/widgets/components.js` 
Again in alphabetical order:
```
dispatcharr: dynamic(() => import("./dispatcharr/component")),
```

### English Translations
- `public/locales/en/common.json`
Again in alphabetical order:

```json
    "dispatcharr": {
        "dispatcharr.version": "Version",
        "dispatcharr.channels": "Channels",
        "dispatcharr.groups": "Groups",
        "dispatcharr.state": "State",
        "dispatcharr.avg_bitrate_kbps": "Avg Bitrate",
        "dispatcharr.resolution": "Resolution",
        "dispatcharr.clients": "Clients",
        "dispatcharr.total_bytes": "Total Bytes"
    },
```

### Service Configuration

 - `config/services.yaml`


```yaml
- Media:
    - Dispatcharr:
        icon: http://dispatcharr.hostname.or.ip:9191/assets/logo-iSLm6iWa.png
        href: http://dispatcharr.hostname.or.ip:9191/
        siteMonitor: http://dispatcharr.hostname.or.ip:9191/
        widget:
          type: dispatcharr
          url: http://dispatcharr.hostname.or.ip:9191/
          username: username
          password: password
```    

### Rebuild Homepage
In the root directory of Homepage:
```
pnpm build
```
