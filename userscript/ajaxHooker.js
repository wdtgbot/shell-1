// ==UserScript==
// @name         ajaxHooker
// @author       cxxjackie
// @version      1.2.1
// @supportURL   https://bbs.tampermonkey.net.cn/thread-3284-1-1.html
// ==/UserScript==

var ajaxHooker = function() {
    const win = window.unsafeWindow || document.defaultView || window;
    const hookFns = [];
    const realXhr = win.XMLHttpRequest;
    const xhrProto = realXhr.prototype;
    const xhrProtoDesc = Object.getOwnPropertyDescriptors(xhrProto);
    const xhrReadyState = xhrProtoDesc.readyState.get;
    const resProto = win.Response.prototype;
    const toString = Object.prototype.toString;
    let realXhrOpen = xhrProto.open;
    let realXhrSend = xhrProto.send;
    const realFetch = win.fetch;
    const xhrResponses = ['response', 'responseText', 'responseXML'];
    const fetchResponses = ['arrayBuffer', 'blob', 'formData', 'json', 'text'];
    function emptyFn() {}
    function errorFn(err) {
        console.error(err);
    }
    function defineProp(obj, prop, getter, setter) {
        Object.defineProperty(obj, prop, {
            configurable: true,
            enumerable: true,
            get: getter,
            set: setter
        });
    }
    function readonly(obj, prop, value = obj[prop]) {
        defineProp(obj, prop, () => value, emptyFn);
    }
    function writable(obj, prop, value = obj[prop]) {
        Object.defineProperty(obj, prop, {
            configurable: true,
            enumerable: true,
            writable: true,
            value: value
        });
    }
    function fireXhrEvent(event) {
        const xhr = event.target;
        const evtConstructor = toString.call(event).slice(8, -1);
        xhr.dispatchEvent(new win[evtConstructor]('ajaxHooker_' + event.type));
        const onEvent = xhr.__ajaxHooker['on' + event.type];
        typeof onEvent === 'function' && onEvent.call(xhr, event);
    }
    function xhrReadyStateChange(e) {
        const xhr = e.target;
        if (xhrReadyState.call(xhr) === 4) {
            const arg = {
                finalUrl: xhr.responseURL,
                status: xhr.status,
                responseHeaders: {}
            };
            const arr = xhr.getAllResponseHeaders().trim().split(/[\r\n]+/);
            for (const line of arr) {
                const parts = line.split(/:\s*/);
                if (parts.length === 2) {
                    const lheader = parts[0].toLowerCase();
                    if (lheader in arg.responseHeaders) {
                        arg.responseHeaders[lheader] += ', ' + parts[1];
                    } else {
                        arg.responseHeaders[lheader] = parts[1];
                    }
                }
            }
            xhrResponses.forEach(prop => {
                defineProp(arg, prop, () => {
                    return xhrProtoDesc[prop].get.call(xhr);
                }, val => {
                    delete arg[prop];
                    arg[prop] = val;
                });
            });
            xhr.dispatchEvent(new CustomEvent('ajaxHooker_responseReady', {
                detail: {arg: arg, event: e}
            }));
        } else {
            fireXhrEvent(e);
        }
    }
    function xhrAsyncEvent(e) {
        e.target.__ajaxHooker.resPromise.then(() => fireXhrEvent(e));
    }
    function fakeXhr() {
        const xhr = new realXhr();
        realXhrOpen = xhr.open;
        xhr.open = fakeXhrOpen;
        realXhrSend = xhr.send;
        xhr.send = fakeXhrSend;
        if (!('__ajaxHooker' in xhr)) {
            try {
                xhr.__ajaxHooker = {
                    abort: false,
                    headers: {},
                    resPromise: Promise.resolve()
                };
                xhr.setRequestHeader = (header, value) => {
                    xhr.__ajaxHooker.headers[header] = value;
                }
                if ('onreadystatechange' in xhrProto && xhr instanceof EventTarget) {
                    const realAddEvent = xhr.addEventListener;
                    xhr.addEventListener = function(...args) {
                        switch (args[0]) {
                            case 'readystatechange':
                            case 'load':
                            case 'loadend':
                                args[0] = 'ajaxHooker_' + args[0];
                        }
                        return realAddEvent.apply(xhr, args);
                    };
                    ['onreadystatechange', 'onload', 'onloadend'].forEach(evt => {
                        defineProp(xhr, evt, () => {
                            return xhr.__ajaxHooker[evt] || null;
                        }, val => {
                            xhr.__ajaxHooker[evt] = typeof val === 'function' ? val : null;
                        });
                    });
                    realAddEvent.call(xhr, 'readystatechange', xhrReadyStateChange);
                    realAddEvent.call(xhr, 'load', xhrAsyncEvent);
                    realAddEvent.call(xhr, 'loadend', xhrAsyncEvent);
                }
            } catch (err) {
                console.error(err);
            }
        }
        return xhr;
    }
    function fakeXhrOpen(method, url, ...args) {
        const xhr = this;
        try {
            xhr.__ajaxHooker.url = url;
            xhr.__ajaxHooker.method = method.toUpperCase();
            xhr.__ajaxHooker.remainArgs = args;
            xhrResponses.forEach(prop => {
                delete xhr[prop]; // delete descriptor
            });
        } catch (err) {
            console.error(err);
        }
        return realXhrOpen.call(xhr, method, url, ...args);
    }
    function fakeXhrSend(data) {
        const xhr = this;
        const req = xhr.__ajaxHooker;
        if (xhrReadyState.call(xhr) === 1 && req) {
            req.data = data;
            try {
                const request = {
                    type: 'xhr',
                    url: req.url,
                    method: req.method,
                    abort: false,
                    headers: req.headers,
                    data: data,
                    response: null
                };
                Promise.all(hookFns.map(fn => Promise.resolve(fn(request)).then(emptyFn, errorFn))).then(() => {
                    Promise.all(['url', 'method', 'abort', 'headers', 'data'].map(key => Promise.resolve(request[key]).then(
                        val => {request[key] = val},
                        () => {request[key] = req[key]}
                    ))).then(() => {
                        if (request.abort) return;
                        realXhrOpen.call(xhr, request.method, request.url, ...req.remainArgs);
                        data = request.data;
                        for (const header in request.headers) {
                            xhrProto.setRequestHeader.call(xhr, header, request.headers[header]);
                        }
                        xhr.addEventListener('ajaxHooker_responseReady', e => {
                            if (typeof request.response === 'function') {
                                e.target.__ajaxHooker.resPromise = Promise.resolve(request.response(e.detail.arg)).then(() => {
                                    const task = [];
                                    xhrResponses.forEach(prop => {
                                        const descriptor = Object.getOwnPropertyDescriptor(e.detail.arg, prop);
                                        if ('value' in descriptor) {
                                            task.push(Promise.resolve(descriptor.value).then(val => {
                                                e.detail.arg[prop] = val;
                                                defineProp(e.target, prop, () => val);
                                            }, emptyFn));
                                        } else {
                                            defineProp(e.target, prop, () => {
                                                return e.detail.arg[prop] = xhrProtoDesc[prop].get.call(e.target);
                                            });
                                        }
                                    });
                                    return Promise.all(task);
                                }, errorFn);
                            }
                            e.target.__ajaxHooker.resPromise.then(() => fireXhrEvent(e.detail.event));
                        });
                        realXhrSend.call(xhr, data);
                    });
                });
            } catch (err) {
                console.error(err);
                return realXhrSend.call(xhr, req.data);
            }
        } else {
            return realXhrSend.call(xhr, data);
        }
    }
    function hookFetchResponse(response, arg, callback) {
        fetchResponses.forEach(prop => {
            response[prop] = () => new Promise((resolve, reject) => {
                resProto[prop].call(response).then(res => {
                    if (prop in arg) {
                        resolve(arg[prop]);
                    } else {
                        arg[prop] = res;
                        Promise.resolve(callback(arg)).then(() => {
                            if (prop in arg) {
                                Promise.resolve(arg[prop]).then(val => resolve(arg[prop] = val), () => resolve(res));
                            } else {
                                resolve(res);
                            }
                        }, errorFn);
                    }
                }, reject);
            });
        });
    }
    function fakeFetch(url, init) {
        try {
            if (toString.call(url) === '[object String]') {
                init = init || {};
                init.headers = init.headers || {};
                const request = {
                    type: 'fetch',
                    url: url,
                    method: (init.method || 'GET').toUpperCase(),
                    abort: false,
                    headers: {},
                    data: init.body,
                    response: null
                };
                if (toString.call(init.headers) === '[object Headers]') {
                    for (const [key, val] of init.headers) {
                        request.headers[key] = val;
                    }
                } else {
                    request.headers = {...init.headers};
                }
                const reqClone = {...request};
                return new Promise((resolve, reject) => {
                    Promise.all(hookFns.map(fn => Promise.resolve(fn(request)).then(emptyFn, errorFn))).then(() => {
                        Promise.all(['url', 'method', 'abort', 'headers', 'data'].map(key => Promise.resolve(request[key]).then(
                            val => {request[key] = val},
                            () => {request[key] = reqClone[key]}
                        ))).then(() => {
                            if (request.abort) return reject('aborted');
                            url = request.url;
                            init.method = request.method;
                            init.headers = request.headers;
                            init.body = request.data;
                            realFetch.call(win, url, init).then(response => {
                                if (typeof request.response === 'function') {
                                    const arg = {
                                        finalUrl: response.url,
                                        status: response.status,
                                        responseHeaders: {}
                                    };
                                    for (const [key, val] of response.headers) {
                                        arg.responseHeaders[key] = val;
                                    }
                                    hookFetchResponse(response, arg, request.response);
                                    response.clone = () => {
                                        const resClone = resProto.clone.call(response);
                                        hookFetchResponse(resClone, arg, request.response);
                                        return resClone;
                                    };
                                }
                                resolve(response);
                            }, reject);
                        });
                    });
                    
                });
            } else {
                return realFetch.call(win, url, init);
            }
        } catch (err) {
            console.error(err);
            return realFetch.call(win, url, init);
        }
    }
    win.XMLHttpRequest = fakeXhr;
    Object.keys(realXhr).forEach(key => {fakeXhr[key] = realXhr[key]});
    fakeXhr.prototype = xhrProto;
    win.fetch = fakeFetch;
    return {
        hook: fn => hookFns.push(fn),
        protect: () => {
            readonly(win, 'XMLHttpRequest', fakeXhr);
            readonly(win, 'fetch', fakeFetch);
        },
        unhook: () => {
            writable(win, 'XMLHttpRequest', realXhr);
            writable(win, 'fetch', realFetch);
        }
    };
}();
