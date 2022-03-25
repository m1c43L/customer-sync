# Hightouch Take Home Exercise

How to run: `npm start {data} {config}`

Note: expected properties like `email`,`created_at`,.. must also be defined through `mappings`

`config.json`
```
    "parallelism": 25,
    "userId": "id",
    "mappings": [{
            "from": "computed_ltv",
            "to": "ltv"
        },
        {
            "from": "name",
            "to": "name"
        }
        ...
    ],

    "credential": {
        apiKey: "----",
        siteId: "----",
    },
    "updateOnly": false
```

`data.json`
```
 [{"id": 123, ... }]
```