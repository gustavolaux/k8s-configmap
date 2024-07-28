const fs = require('node:fs');
const assert = require('node:assert');

// TODO: add built-in parsers like yaml

module.exports = class ConfigMap {
    constructor(configmapRootPath, keys, options) {
        assert(configmapRootPath, 'configmap root path is required');
        assert(keys, 'keys is required');
        assert(Array.isArray(keys), 'keys must be an array');
        assert(keys.length > 0, 'keys must have at least one element');

        this.volumePath = configmapRootPath;
        this.keys = this.#formatKeys(keys);

        this.debug = options?.debug || false;
    }

    static Key = (name, parser) => {
        return {
            name: name,
            parse: !!parser,
            parser: parser,
            subscriptions: [],
        };
    };

    // REFACT: this doesn't look good
    #formatKeys(keys) {
        return keys.reduce((acc, key) => {
            key.path = `${this.volumePath}/${key.name}`;

            acc[key.name] = key;

            return acc;
        }, {});
    }

    #getKey(name) {
        const key = this.keys[name];

        if (!key) throw new Error('key not found');

        return key;
    }

    #parse(key, content) {
        if (!key.parse) return content;

        try {
            return key.parser(content);
        } catch (error) {
            if (this.debug) console.error(error);

            // TODO: should we throw an error? if not, the configmap.read will return "an error as a value" instead of an stacktrace
            return null;
        }
    }

    read(name) {
        return new Promise((resolve, reject) => {
            try {
                const key = this.#getKey(name);

                fs.readFile(key.path, 'utf8', (err, content) => {
                    if (err) {
                        if (this.debug) console.error(err);

                        return reject(new Error('error reading key'));
                    }

                    return resolve(this.#parse(key, content));
                });
            } catch (error) {
                if (this.debug) console.error(error);

                return reject(error);
            }
        });
    }

    on(name, callback) {
        const key = this.#getKey(name);

        key.subscriptions.push(callback);

        // only watch file if it's the first subscription
        // change this later on when/if we add a way to unsubscribe
        if (key.subscriptions.length === 1) {
            fs.watchFile(key.path, () => {
                this.read(key.name)
                    .then((content) => {
                        key.subscriptions.forEach((cb) => cb(content));
                    })
                    .catch((error) => {
                        // should we re-watch this file?
                        if (this.debug) console.error(`error watching file "${key.path}"`, error);
                    });
            });
        }
    }
}
