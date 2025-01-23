import { useMemo, useSyncExternalStore } from 'react';

const isDocumentReady = ()=>document.readyState === 'complete' || document.readyState === 'interactive';
const makeQueue = ()=>{
    const queueHolder = function() {
        queueHolder.loaderQueue(arguments);
    };
    queueHolder.q = [];
    queueHolder.loaderQueue = function(args) {
        queueHolder.q.push(args);
    };
    return queueHolder;
};
const events = [
    'boot',
    'shutdown',
    'update',
    'hide',
    'show',
    'showSpace',
    'showMessages',
    'showNewMessage',
    'onHide',
    'onShow',
    'onUnreadCountChange',
    'trackEvent',
    'getVisitorId',
    'startTour',
    'showArticle',
    'showNews',
    'startSurvey',
    'startChecklist',
    'showTicket',
    'showConversation'
];
const regions = {
    us: 'https://api-iam.intercom.io',
    eu: 'https://api-iam.eu.intercom.io',
    ap: 'https://api-iam.au.intercom.io'
};
const scriptElementId = '_intercom_npm_loader';
const addWidgetToPage = ()=>{
    const d = document;
    if (d.getElementById(scriptElementId)) {
        return;
    }
    const s = document.createElement('script');
    s.type = 'text/javascript';
    s.async = true;
    s.id = scriptElementId;
    s.src = 'https://widget.intercom.io/widget/' + window.intercomSettings?.app_id;
    const x = d.getElementsByTagName('script')[0];
    x.parentNode?.insertBefore(s, x);
};
const init = ({ region, ...props })=>{
    if (typeof window === 'undefined') {
        return;
    }
    const w = window;
    const ic = w.Intercom;
    const config = {
        ...props,
        api_base: region in regions ? region[region] : 'us'
    };
    w.intercomSettings = config;
    if (typeof ic === 'function') {
        ic('reattach_activator');
        ic('update', config);
    } else {
        w.Intercom = makeQueue();
        if (isDocumentReady()) {
            addWidgetToPage();
        } else {
            document.addEventListener('readystatechange', function() {
                if (isDocumentReady()) {
                    addWidgetToPage();
                }
            });
            if (w.attachEvent) {
                w.attachEvent('onload', addWidgetToPage);
            } else {
                w.addEventListener('load', addWidgetToPage, false);
            }
        }
    }
};
const invokeMethod = (method, ...args)=>{
    if (typeof window === 'undefined') {
        return;
    } else if (!window.Intercom) {
        console.warn(`Intercom method '${method}' was called prior to loading`);
        return;
    }
    window.Intercom(method, ...args);
};
const bindIntercom = (key)=>(...args)=>invokeMethod(key, ...args);
const createIntercom = ()=>{
    const client = {
        init
    };
    events.forEach((event)=>{
        client[event] = bindIntercom(event);
    });
    return client;
};
const client = createIntercom();

const getSnapshop = ()=>client;
const makeSubscribe = (props)=>(_)=>{
        const autoBoot = 'auto_boot' in props ? props['auto_boot'] : true;
        client.init(props);
        if (autoBoot) client.boot(props);
        return ()=>{
            client.shutdown();
        };
    };
const useIntercom = (props)=>{
    const subscribe = useMemo(()=>makeSubscribe(props), [
        props
    ]);
    const client = useSyncExternalStore(subscribe, getSnapshop);
    return client;
};

export { client as intercomClient, useIntercom };
