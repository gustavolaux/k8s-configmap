# k8s-configmap

[![npm version](https://img.shields.io/npm/v/k8s-configmap.svg?style=flat)](https://www.npmjs.org/package/k8s-configmap)
[![install size](https://packagephobia.now.sh/badge?p=k8s-configmap)](https://packagephobia.now.sh/result?p=k8s-configmap)
[![language](https://img.shields.io/github/languages/top/gustavolaux/k8s-configmap?style=flat)](https://www.npmjs.org/package/k8s-configmap)
[![npm](https://img.shields.io/npm/dm/k8s-configmap?style=flat)](https://www.npmjs.org/package/k8s-configmap)

A simple yet complete kubernetes' configmap watcher

## Installation

```shell
npm i -S k8s-configmap
```

## Preconfiguration

I'm considering that you alread read the official guide on mapping configmap as volumes and it's working. If not, here it is https://kubernetes.io/docs/concepts/configuration/configmap/#using-configmaps-as-files-from-a-pod

## Usage

_I'll use [this configmap](./examples/configmap.yaml) for this tutorial_

The exported class expects the root configmap folder (specified in your deployment configuration as mentioned in the above doc), an array of keys to use and an optional options object

```js
const ConfigMap = require('k8s-configmap');

const CONFIGMAP_ROOT_PATH = '/configmap';

const CONFIGMAP_KEYS = {
    GAME_PROPERTIES: 'game.properties',
    CONFIG: 'config.json',
};

const configmap = new ConfigMap(CONFIGMAP_NAME, [
    ConfigMap.Key(CONFIGMAP_KEYS.GAME_PROPERTIES),
    ConfigMap.Key(CONFIGMAP_KEYS.CONFIG, JSON.parse),
], { debug: true });

(async () => {
    for (const key of Object.keys(CONFIGMAP_KEYS)) {
        const current = await configmap.read(CONFIGMAP_KEYS[key]);

        console.log(`initial value from ${key}: [${typeof current}]`, current);

        configmap.on(CONFIGMAP_KEYS[key], (updated) => {
            console.log(`${key} changed`, updated);
        });
    }
})();
```

## Roadmap

- add built-in parsers for common files (json, key-values, etc)

## Why still on beta

Im not sure if im really happy with this code, but it works
