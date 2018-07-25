function UET(initData) {

    this.stringExists = function (temp) {
        return (temp && temp.length > 0);
    };

    ///<field name='domain' type='String'>The domain that beacons are fired to, typically bat.bing.com</field>
    this.domain = "bat.bing.com";

    ///<field name='URLLENGTHLIMIT' type='Number'>The length of the URL after which the library will fire a POST beacon instead of an img tag. G/AFD supports 4k</field>
    this.URLLENGTHLIMIT = 4096;

    ///<field name='pageLoadEvt' type='String'>Page load event name auto fired on snippet load</field>
    this.pageLoadEvt = "pageLoad";

    ///<field name'customEvt' type='String'>Custom event name</field>
    this.customEvt = "custom";

    ///<field name'page_view' type='String'>Page view event for manually fired events (ex. SPA)</field>
    this.pageViewEvt = 'page_view';

    ///<field name='Ver' type='Number'>Version of the UET API</field>
    if (initData.Ver !== undefined && (initData.Ver === '1' || initData.Ver === 1)) {
        initData.Ver = 1;
    } else {
        initData.Ver = 2;
    }

    ///<field name='supportsCORS' type='Boolean'>Flag that determines if the browser supports CORS</field>
    ///<field name='supportsXDR' type='Boolean'>Flag that determines if the browser supports XDomainRequest</field>
    this.supportsCORS = this.supportsXDR = false;

    ///<field name='paramValidations' type='Object'>Standard parameter validation settings</field>
    this.paramValidations = {
        string_hotel_partner: { type: 'regex', regex: /^[a-zA-Z0-9]{1,64}$/, error: 'Hotel partner ID ({p}) must contain 1-64 alphanumeric characters only.' },
        string_hotel_booking: { type: 'regex', regex: /^[a-zA-Z0-9]{1,64}$/, error: 'Booking ID ({p}) must contain 1-64 alphanumeric characters only. If you use the customer’s actual booking reference number, it must be obfuscated or encrypted.' },
        string_currency: { type: 'regex', regex: /^[a-zA-Z]{3}$/, error: '{p} value must be ISO standard currency code' },
        //string_prodid: { type: 'regex', regex: /^[a-zA-Z0-9\-]{1,50}$/, error: '{p} value must be alphanumeric (including hyphen) between 1 and 50 chars' },
        number: { type: 'num', digits: 3, max: 999999999999 },
        integer: { type: 'num', digits: 0, max: 999999999999 },
        hct_los: { type: 'num', digits: 0, max: 30 },
        date: { type: 'regex', regex: /^\d{4}-\d{2}-\d{2}$/, error: '{p} value must be in YYYY-MM-DD date format' },
        'enum': { type: 'enum', error: '{p} value must be one of the allowed values' },
        'array': { type: 'array', error: '{p} must be an array with 1+ elements' }
    };

    ///<field name='knownParams' type='Object'>Standard parameters</field>
    this.knownParams = {
        // custom events
        event_action:   { beacon: 'ea' },
        event_category: { beacon: 'ec' },
        event_label:    { beacon: 'el' },
        event_value:    { type: 'number', beacon: 'ev' },

        // SPA / manual page load - custom handling in code
        page_title:     {},
        page_location:  {},
        page_path:      {},

        // retail
        ecomm_prodid:       { beacon: 'prodid' },   // allowed to be array, custom handling in code
        ecomm_pagetype:     { type: 'enum', values: [ 'home', 'searchresults', 'category', 'product', 'cart', 'purchase', 'other' ], beacon: 'pagetype' },
        ecomm_totalvalue:   { type: 'number' },
        ecomm_category:     {},

        // hotel
        hct_base_price:         { type: 'number' },
        hct_booking_xref:       { type: 'string_hotel_booking' },
        hct_checkin_date:       { type: 'date' },
        hct_checkout_date:      { type: 'date' },
        hct_length_of_stay:     { type: 'hct_los' },
        hct_partner_hotel_id:   { type: 'string_hotel_partner' },
        hct_total_price:        { type: 'number' },
        hct_pagetype:           { type: 'enum', values: [ 'home', 'searchresults', 'offerdetail', 'conversionintent', 'conversion', 'property', 'cart', 'purchase', 'cancel', 'other' ] },

        // travel
        travel_destid:      {},
        travel_originid:    {},
        travel_pagetype:    { type: 'enum', values: [ 'home', 'searchresults', 'offerdetail', 'conversionintent', 'conversion', 'cancel', 'other' ] },
        travel_startdate:   { type: 'date' },
        travel_enddate:     { type: 'date' },
        travel_totalvalue:  { type: 'number' },

        // standard params
        affiliation:        {},
        checkout_option:    {},
        checkout_step:      { type: 'integer' },
        content_id:         {},
        content_type:       {},
        coupon:             {},
        currency:           { type: 'string_currency', beacon: 'gc' },
        description:        {},
        fatal:              {},
        method:             {},
        name:               {},
        revenue_value:      { type: 'number', beacon: 'gv' },
        screen_name:        {},
        search_term:        {},
        shipping:           { type: 'number' },
        tax:                { type: 'number' },
        transaction_id:     {},

        // standard params: items
        items:                  { type: 'array' },
        'items.brand':          {},
        'items.category':       {},
        'items.creative_name':  {},
        'items.creative_slot':  {},
        'items.id':             {},
        'items.list_name':      {},
        'items.list_position':  { type: 'integer' },
        'items.location_id':    {},
        'items.name':           {},
        'items.price':          { type: 'number' },
        'items.quantity':       { type: 'number' },
        'items.variant':        {},

        // standard params: promotions
        promotions:                 { type: 'array' },
        'promotions.creative_name': {},
        'promotions.creative_slot': {},
        'promotions.id':            {},
        'promotions.name':          {}
    };

    ///<field name='knownEvents' type='Object'>Standard events</field>
    this.knownEvents = {
        add_payment_info:       [],
        add_to_cart:            [ 'revenue_value', 'currency', 'items' ],
        add_to_wishlist:        [ 'revenue_value', 'currency', 'items' ],
        begin_checkout:         [ 'revenue_value', 'currency', 'items', 'coupon' ],
        checkout_progress:      [ 'revenue_value', 'currency', 'items', 'coupon', 'checkout_step', 'checkout_option' ],
        exception:              [ 'description', 'fatal' ],
        generate_lead:          [ 'revenue_value', 'currency', 'transaction_id' ],
        login:                  [ 'method' ],
        page_view:              [ 'page_title', 'page_location', 'page_path' ],
        purchase:               [ 'transaction_id', 'revenue_value', 'currency', 'tax', 'shipping', 'items', 'coupon' ],
        refund:                 [ 'transaction_id', 'revenue_value', 'currency', 'tax', 'shipping', 'items' ],
        remove_from_cart:       [ 'revenue_value', 'currency', 'items' ],
        screen_view:            [ 'screen_name' ],
        search:                 [ 'search_term' ],
        select_content:         [ 'items', 'promotion', 'content_type', 'content_id' ],
        set_checkout_option:    [ 'checkout_step', 'checkout_option' ],
        share:                  [ 'method', 'content_type', 'content_id' ],
        sign_up:                [ 'method' ],
        view_item:              [ 'items' ],
        view_item_list:         [ 'items' ],
        view_promotion:         [ 'promotions' ],
        view_search_results:    [ 'search_term' ]
    };

    ///<field name='validCustomEventKeyNames' type='Object'>Page level params can be set to be auto included for standards events</field>
    this.pageLevelParams = {};

    ///<field name='validCustomEventKeyNames' type='Object'>List of valid keys that are only allowed as part of the legacy custom evt call</field>
    this.legacyValidCustomEventKeyNames = {
      "ec": 1, "el": 1, "ev": 1, "ea": 1, "gv": 1, "gc": 1,
      "prodid": 1, "pagetype": 1
    };

    ///<field name='validCustomEventKeyNames' type='Object'>List of valid keys allowed with both new and legacy syntax</field>
    this.ambiguousValidCustomEventKeyNames = {
      "ecomm_prodid": 1, "ecomm_pagetype": 1
    };

    ///<field name='validRetailPageTypeValues' type='Object'>List of valid pagetype values that are allowed as part of the custom evt call</field>
    this.validRetailPageTypeValues = {
      "home": 1, "searchresults": 1, "category": 1, "product": 1, "cart": 1, "purchase": 1, "other": 1
    };

    this.invalidKeyException = "Invalid data: Key Name: ";
    this.invalidEventException = "Invalid event type: Event Type: ";
    this.invalidPageTypeException = "Invalid pagetype value: ";

    this.invalidProdIdException = "The prodid value must be within 1 to 50 characters. Hyphen and alphanumeric characters are allowed.";
    this.missingPageTypeException = "The pagetype parameter is required when you include the prodid parameter.";
    this.goalCurrencyFormatException = "gc value must be ISO standard currency code";
    this.missingHotelParametersException = "The hotel total price (hct_total_price) and currency parameters are required when you include other hotel parameters.";
    this.hotelVariableRevenueException = "The variable revenue parameter (gv) cannot be sent when you include other hotel parameters.";

    ///<field name='evq' type='Object'>An array of events that were queued before UET is available</field>
    this.evq = initData.q || [];
    delete initData.q;

    ///<field name='evqDispatch' type='Boolean'>Flag to indicate if event queue dispatch was attempted</field>
    this.evqDispatch = false;

    ///<field name='pageLoadDispatch' type='Boolean'>Flag to indicate if pageLoad event dispatch was attempted</field>
    this.pageLoadDispatch = false;

    /// TFS: 1225144 Bat.js needs to detect if host has completed DOM loading
    /// <field name='documentLoaded' type='Boolean'>Flag to indicate if document loading bat.js has completed loading</field>
    this.documentLoaded = !!document.body;
    /// <field name='eventPushQueue' type='Array'>Queue to host events until documentLoaded is not true</field>
    this.eventPushQueue = [];
    /// variable to hold this reference
    var uetInstance = this;

    ///<field name='sessionCookieName' type='String'>The name of first party cookie for Session Id</field>
    this.sessionCookieName = "_uetsid";

    ///<field name='sessionCookieValuePrefix' type='String'>The prefix in value of first party cookie for Session Id</field>
    this.sessionCookieValuePrefix = "_uet";

    ///<field name='sessionExpirationTime' type='Number'>The length of a session in seconds</field>
    this.sessionExpirationTime = 1800;

    ///<field name='domainName' type='String'>The cache for the highest level domain to set cookie</field>
    this.domainName = null;

    ///<field name='lengthSid' type='Number'>The maximum length in bytes for the sid value</field>
    this.lengthSid = 8;

    ///<field name='msClkIdCookieName' type='String'>The name of first party cookie for MSCLKID</field>
    this.msClkIdCookieName = "_uetmsclkid";

    ///<field name='msClkIdCookieValuePrefix' type='String'>The prefix in value of first party cookie for MSCLKID</field>
    this.msClkIdCookieValuePrefix = "_uet";

    ///<field name='msClkIdParamName' type='String'>The landing page URL query string parameter name of MSCLKID</field>
    this.msClkIdParamName = "msclkid";

    ///<field name='msClkIdExpirationTime' type='Number'>The expiration time of a MSCLKID cookie in seconds</field>
    this.msClkIdExpirationTime = 7776000; // 90-day conversion window - 90x24x60x60

    ///<field name='lengthMsClkId' type='Number'>The maximum length in bytes for the sid value</field>
    // Referring to https://advertise.bingads.microsoft.com/en-us/resources/policies/bing-ads-click-measurement-description-of-methodology
    // MSCLKID consists of 16-byte information, with a HEX representation using 32-byte string
    this.lengthMsClkId = 32;

    ///<field name='msClkId' type='String'>The msclkid extracted from full URL of current top page</field>
    this.msClkId = null;

    ///<field name='cookieAllowed' type='Boolean'>Flag to indicate if 1st-party cookie is allowed to be stored and read</field>
    this.cookieAllowed = true;

    // This provides a way for advertisers to opt out for 1st-party cookies to be dropped or read on their domains
    if (initData.storeConvTrackCookies === false) {
        this.cookieAllowed = false;
    }

    delete initData.storeConvTrackCookies;

     ///<field name='cookieAllowed' type='Boolean'>Flag to indicate if Navigation Timing API metrics are enabled for pageLoad event</field>
    this.navTimingApi = false;

    // This provides a way for advertisers to opt in for Navigation Timing API metrics
    if (initData.navTimingApi === true) {
        this.navTimingApi = true;
    }

    delete initData.navTimingApi;

    /// <summary>Method to check if Host document is loaded</summary>
    this.checkuetHostdocumentload = function () {
        this.documentLoaded = !!document.body;
        // check if now document.body is ready. If it is not ready do another check in 5ms; otherwise do not do another check
        if (!uetInstance.documentLoaded) {
            setTimeout(function () {
                uetInstance.checkuetHostdocumentload();
            }, 5);
        }
        else if (uetInstance.eventPushQueue.length > 0) {
            // process event queue, if there are events in queue
            for (var i = 0; i < uetInstance.eventPushQueue.length; i++) {
                // call internal push with events since document is now ready
                uetInstance._push(uetInstance.eventPushQueue[i]);
            }
            // clear event queue
            uetInstance.eventPushQueue = [];
        }
    };

    // call to check if host document is loaded
    this.checkuetHostdocumentload();
    /// END TFS: 1225144

    // Checks for whether CORS is supported on the browser
    // window.XMLHttpRequest !== undefined required or IE6
    if (window.XMLHttpRequest !== undefined && "withCredentials" in new XMLHttpRequest()) {
        this.supportsCORS = true;
    }

    // Checks for whether XDR is supported on the browser
    if (typeof XDomainRequest !== "undefined") {
        this.supportsXDR = true;
    }

    ///<summary>Push method to mimic array push once 'uetq' is transformed to UET object</summary>
    this.push = function () {
        // this function supports the following:
        //  push('pageLoad')                                        : auto pageload event (fired from snippet)
        //  push({ ea: 'action', el: 'label', ... })                : legacy custom event
        //  push('event', 'action', { event_label: 'label', ... })  : new format custom event w/params
        //  push('event', 'action')                                 : new format custom event without params (just ea/event name)
        //  push('set', { currency: 'USD' })                        : page level set for whitelisted params

        var args = arguments;

        var cmd, params;
        var autoOrLegacy = false;

        if (args.length === 1) {
            cmd = 'event';

            if (args[0] === this.pageLoadEvt) {
                // auto pageLoad event
                params = [ this.pageViewEvt, {} ];
                autoOrLegacy = true;
            } else {
                // only the first element from the supplied array data
                // is considered as batched event push is not supported
                if (args[0] instanceof Array) {
                    if (args[0].length > 0) {
                        args[0] = args[0][0];
                    } else {
                        return;
                    }
                }

                // legacy custom event
                params = [ '', args[0] || {} ];
                autoOrLegacy = true;
            }
        } else if (args.length > 1 && args[0] !== this.pageLoadEvt) {
            // new syntax (<cmd>, <params>)
            cmd = args[0];
            params = Array.prototype.slice.call(args, 1);
        } else {
            return;
        }

        // TFS: 1225144 the internal method _push to be called only after document load is complete.
        if (uetInstance.documentLoaded) {
            uetInstance._push([ cmd, params, autoOrLegacy ]);
        } else {
            // otherwise push the events to queue
            uetInstance.eventPushQueue.push([ cmd, params, autoOrLegacy ]);
        }
    };

    /// TFS: 1225144 this internal method to be called only after document load is complete.
    /// This will ensure that document.body is initialized before we try to create invisible element.
    ///<summary>Internal Push method</summary>
    this._push = function (param) {
        // param[0] : cmd
        // param[1] : args

        if (!(param[1] instanceof Array)) {
            return;
        }

        if (param[0] === 'event')
        {
            var evtParams = param[1][1] || {};
            var evtAction = param[1][0];

            if (evtAction === null || evtAction === undefined)
                return;

            // parsing later on uses evtType == this.pageLoadEvt; only these two event types are supported (pageLoad, custom), no others
            var evtType = (evtAction === this.pageViewEvt) ? this.pageLoadEvt : this.customEvt;

            // param[2] : true if this is a legacy syntax event or an auto/first pageLoad event
            this.evt(evtType, evtAction, evtParams, param[2]);
        }
        else if (param[0] === 'set')
        {
            if (typeof param[1][0] !== "object") {
                return;
            }

            for (var p in param[1][0]) {
                // skip unless it is a standard property
                if (!this.knownParams.hasOwnProperty(p)) {
                    continue;
                }

                // FIXME: add validations with error event to JS console, G & UET helper warning

                // set page level param to raw value
                this.pageLevelParams[p] = param[1][0][p];
            }
        }
    };

    ///<summary>Dispatch all queued events</summary>
    this.dispatchq = function () {
        // FIXME: ideally we can get rid of this if we require the snippet to be placed in the head, or first before any event
        // this is standard with other company's snippets

        // Queued events dispatch attempted
        this.evqDispatch = true;

        var cmd, action;

        // Dispatch all queued events from the global uet queue
        for (var i = 0; i < this.evq.length; i++) {
            if (typeof this.evq[i] === 'object') {
                // object means either:
                // - standalone old format event
                // - old format event after a new format event w/o params
                // - params for a new format event
                // - params for a 'set' operation

                var args = this.evq[i];

                if (cmd === 'set') {
                    this.push(cmd, args);
                } else if (cmd === 'event') {
                    // these parameters always indicate a legacy style event
                    var legacy = false;
                    for (var k in this.legacyValidCustomEventKeyNames) {
                        if (args.hasOwnProperty(k)) {
                            legacy = true;
                            break;
                        }
                    }

                    if (action !== undefined)
                    {
                        // NOTE: ambigious parameters (ecomm_prodid, ecomm_pagetype) can be in both new and old syntax
                        // if found following a new syntax event directive, assume

                        this.push(cmd, action, legacy ? {} : args);

                        if (legacy) {
                            this.push(args);
                        }
                    }

                    // drop if action not set
                    // FIXME: push warning to JS console & UET helper
                } else {
                    this.push(args);
                }

                // object always ends command parsing
                cmd = action = undefined;
            } else if (typeof this.evq[i] === 'string' || this.evq[i] instanceof String) {
                // no need to process auto pageLoad event since it is fired after UET object creation (in snippet)

                // if previous item completes a no args new style event, fire the event
                if (cmd !== undefined && action !== undefined)
                {
                    this.push(cmd, action, {});
                    cmd = action = undefined;
                }

                var str = this.evq[i];

                if (cmd === undefined && (str === 'set' || str === 'event')) {
                    cmd = str;
                } else if (cmd !== undefined && action === undefined) {
                    action = str;
                } else {
                    // FIXME: push warning to JS console, G error, & UET helper
                    // reset on incorrect syntax
                    cmd = action = undefined;
                }

                // if final item is a no args new style event, fire the event
                if (i === this.evq.length - 1 && cmd === 'event' && action !== undefined) {
                    this.push(cmd, action, {});
                }
            } else {
                // FIXME: push warning to JS console, G error, & UET helper
                // reset on incorrect syntax
                cmd = action = undefined;
            }
        }
    };

    var protocol = window.location.protocol;

    //NOTE: Minifier will remove #DEBUG section
    ///#DEBUG
    if (initData.debug) {

        var db = initData.debug;

        // Sets the batDomian
        if (db.batDomain) {
            this.domain = db.batDomain;
        }

        if (db.CORS === true) {
            this.URLLENGTHLIMIT = 1;
            this.supportsCORS = this.supportsXDR = true;
        }

        if (db.formOnly) {
            this.URLLENGTHLIMIT = 1;
            this.supportsCORS = this.supportsXDR = false;
        }

        if (db.protocol) {
            protocol = db.protocol;
        }

        if (db.r) {
            initData.r = initData.p = encodeURIComponent(db.r);
        }
        delete initData.debug;
    }
    ///#ENDDEBUG

    var advertiserId = 0;
    if (initData.Ver === 1 && initData.advertiserId !== undefined) {
        advertiserId = initData.advertiserId;
    }

    this.postURL = protocol + "//" + this.domain + "/action/" + advertiserId;
    this.urlPrefix = this.postURL + "?";

    // Removing the advertiserId since it's not supposed to be part of the request parameters
    delete initData.advertiserId;
    delete initData.adv;

    if (initData.Ver !== 1) {
        //Feature 1067925: Replace tagId with ti
        if (this.stringExists(initData.tagId) && !this.stringExists(initData.ti)) {
            initData.ti = initData.tagId;
        }
        delete initData.tagId;
        delete initData.Sig; //Feature 1067928: Removing the Sig variable from initData
    }

    this.invisibleDiv = null;
    this.invisibleFrame = null;

    this._S4 = function () {
        return (Math.floor((1 + Math.random()) * 0x10000)).toString(16).substring(1);
    };

    this.getGuid = function () {
        /// <summary> Gets the generated guid for this generator </summary>
        /// <returns type='String'> the generated guid </returns>

        var guid = (this._S4() + this._S4() + "-" + this._S4() + "-" + this._S4() + "-" + this._S4() + "-" + this._S4() + this._S4() + this._S4());
        return guid;
    };

    //Adding this additional parameter so that the field can be joined across two different systems.
    initData.mid = this.getGuid();

    //Converts a JSON object to a request style string that can be added to the end of a URL
    this.stringifyToRequest = function (ob, name) {
        /// <summary> Converts a JSON object to a request string </summary>
        /// <param name='ob' type='Object'> A JSON data object </param>
        /// <param name='name' type='String'> A prefix name that is added to every field key </param>
        /// <returns type='String'> A stringified representation of the object in the URL request format </returns>

        var str = "";

        var prefix = "";
        if (name) {
            prefix = name + ".";
        }

        for (var i in ob) {
            if ((typeof ob[i]) === "object") {
                str += this.stringifyToRequest(ob[i], prefix + i);
            }
            else {
                str += prefix + i + "=" + ob[i] + "&";
            }
        }
        return str;
    };

    this.createInvisibleElement = function (parent, elementType) {
        /// <summary> Creates an invisible HTML element on the DOM </summary>
        /// <param name='parent' type='DOMElement'> The HTML under which the new element is created </param>
        /// <param name='elementType' type='String'> The element that is going to be created </param>
        /// <returns type='DOMElement'> The DOM element that is created </returns>
        var el = document.createElement(elementType);
        el.setAttribute("style", "width:0px; height:0px; display:none; visibility:hidden;");
        el.id = "batBeacon" + Math.random("bat");
        parent.appendChild(el);
        return el;
    };

    this.createInvisibleDiv = function (parent) {
        /// <summary> Creates an invisible DIV element on the DOM </summary>
        /// <param name='parent' type='DOMElement'> The HTML under which the new element is created </param>
        /// <returns type='DOMElement'> The DOM element that is created </returns>
        this.invisibleDiv = this.createInvisibleElement(parent, "div");
        return this.invisibleDiv.id;
    };

    this.fireBeaconImg = function (url) {
        /// <summary> Fire a beacon using an img tag </summary>
        /// <param name='url' type='String'>The URL of the beaon</param>
        var beaconImg = this.createInvisibleElement(this.invisibleDiv, "img");
        // set width and height to prevent broken image icons in IE10 compatibility view
        beaconImg.width = 0;
        beaconImg.height = 0;
        // set random value r in the image source for multiple beacon calls with same parameters to work
        // without random value IE does not fire beacon if the img url is same
        // example: Click play/pause button multiple times on the page
        // this is need for IE7 to IE11+, IE6 and other browsers work without random value added
        var r = Math.floor(Math.random() * 1E6);
        var rurl = url + "&rn=" + r;
        beaconImg.setAttribute("alt", "");
        if (initData.alt) {
          beaconImg.setAttribute("alt", initData.alt);
        }
        beaconImg.setAttribute("src", rurl);
        return r;
    };

    this.addLoadTime = function (data) {
        /// <summary> Add the load time of the page to the JSON data object </summary>
        /// <param name='data' type='Object'>The data object to be augmented</param>
        /// <returns type='Object'> The augmented data object </returns>

        if (window.performance) {
            var endEventTime = window.performance.timing.domContentLoadedEventEnd;
            if (window.performance.timing.loadEventEnd) {
                endEventTime = window.performance.timing.loadEventEnd;
            }

            //If we arent able to determine the end of the load time don"t send performance metrics
            if (endEventTime !== undefined && endEventTime !== 0) {
                var loadTime = (endEventTime - window.performance.timing.navigationStart);
                data.lt = loadTime;
            }

            // add full perf timing/nav info, currently opt-in only for testing & analysis
            if (this.navTimingApi && (window.performance.timing != null))
            {
                // list of 21 timing attributes to collect
                var pList = [ 'navigationStart', 'unloadEventStart', 'unloadEventEnd', 'redirectStart', 'redirectEnd', 'fetchStart', 'domainLookupStart', 'domainLookupEnd', 'connectStart', 'connectEnd', 'secureConnectionStart', 'requestStart', 'responseStart', 'responseEnd', 'domLoading', 'domInteractive', 'domContentLoadedEventStart', 'domContentLoadedEventEnd', 'domComplete', 'loadEventStart', 'loadEventEnd' ];

                // start time (for diff calculation)
                var s = window.performance.timing[pList[0]];

                var pt = s;
                for (var i = 1; i < pList.length; i++)
                {
                    var attr = window.performance.timing[pList[i]];
                    pt += ',';

                    // empty if zero or undefined, otherwise diff between param and start time
                    pt += (attr == null || attr === 0) ? '' : attr - s;
                }

                // limit total length of performance timing parameter to 150
                if (pt.length <= 150) {
                    data.pt = pt;
                }

                // include performance navigation attributes (may be dropped later if not useful)
                if (window.performance.navigation != null) {
                    data.pn = window.performance.navigation.type + ',' + window.performance.navigation.redirectCount;
                }
            }
        }
        return data;
    };

    this.hashCode = function (str) {
        var hash = 0;
        if (str.length === 0) {
            return hash;
        }
        for (var i = 0; i < str.length; i++) {
            var char = str.charCodeAt(i);
            hash = ((hash << 5) - hash) + char;
            hash = hash & hash; // Convert to 32bit integer
        }
        return hash;
    };

    this.addPluginData = function (data) {
        /// <summary> Adds fraud signal, plugin detail, to the JSON data object </summary>
        /// <param name='data' type='Object'>The data object to be augmented</param>
        /// <returns type='Object'> The augmented data object </returns>

        // Concatenate all plugin names in sorted order and compute the hash on the concatenated string
        var plugins = [];
        for (var i = 0; i < window.navigator.plugins.length; i++) {
            plugins.push({ name: window.navigator.plugins[i].name });
        }

        var pi = plugins.sort(function (a, b) {
            if (a.name > b.name) {
                return 1;
            }
            if (a.name < b.name) {
                return -1;
            }
            // a must be equal to b
            return 0;
        });

        var concatNames = "";
        for (var j = 0; j < pi.length; j++) {
            concatNames += pi[j].name;
        }

        data.pi = this.hashCode(concatNames);
        return data;
    };

    //Feature 1067931: Adding signals for the RnR team to detect fraud
    this.addFraudSignals = function (data) {
        /// <summary> Add fraud signals to the JSON data object </summary>
        /// <param name='data' type='Object'>The data object to be augmented</param>
        /// <returns type='Object'> The augmented data object </returns>
        data = this.addPluginData(data);

        // Adding Language
        var language = window.navigator.userLanguage || window.navigator.language;

        if (this.stringExists(language)) {
            data.lg = language;
        }

        // Adding Screen Dimensions
        if (screen) {
            if (screen.width) {
                data.sw = screen.width;
            }

            if (screen.height) {
                data.sh = screen.height;
            }

            if (screen.colorDepth) {
                data.sc = screen.colorDepth;
            }
        }
        return data;
    };

    this.addUrlData = function (data) {
        var refNoParams = "";

        var ref = window.document.referrer;
        if (this.stringExists(ref)) {
            data.r = encodeURIComponent(ref);
            // remove query string parameters
            refNoParams = ref.split("?")[0];
        }

        // TFS 1113022: UET Snippet - Pass correct referrer URL when UET tag is inside iFrame
        // iFrame
        //   r (aka NavigatedFrom URL) = empty
        //   p (aka Page URL)          = window.document.referrer *with* query parameters
        // normal case,
        //   r (aka NavigatedFrom URL) = window.document.referrer *without* query parameters
        //   p (aka Page URL)          = window.location

        // inside an iFrame?
        if (window.self != window.top) {
            if (data.hasOwnProperty("r")) {
                data.p = data.r;
                data.r = "";
            }
        } else {
          var href = window.location.href;
          var hash = window.location.hash;
          var fullUrl = href.indexOf(hash) >= 0 ? href : href + hash;

          data.p = encodeURIComponent(fullUrl);
          data.r = encodeURIComponent(refNoParams);
        }
        // End TFS 1113022

        return data;
    };

    this.extractMsClkId = function (data) {
        if (!this.stringExists(this.msClkId)) {
            this.msClkId = this.getQueryParam(data.p, this.msClkIdParamName);
        }
    };

    this.addPageData = function (data) {
        /// <summary> Add some page data to the JSON data object. Title and Keyword are encoded, except the comma character to prevent url getting too long </summary>
        /// <param name='data' type='Object'>The data object to be augmented</param>
        /// <returns type='Object'> The augmented data object </returns>

        data = this.addLoadTime(data);
        data = this.addFraudSignals(data);

        var title = window.document.title;
        if (this.stringExists(title)) {
            data.tl = encodeURIComponent(title).replace(/%2C/gi, ",");
        }

        if (window.document.head.getElementsByTagName("meta")["keywords"]) {
            var keywords = window.document.head.getElementsByTagName("meta")["keywords"].content;
            if (this.stringExists(keywords)) {
                data.kw = encodeURIComponent(keywords).replace(/%2C/gi, ",");
            }
        }

        data = this.addUrlData(data);
        this.extractMsClkId(data);

        return data;
    };

    this.removeTrailingAmp = function (str) {
        /// <summary> Removes a trailing & if it's present </summary>
        /// <param name='str' type='String'>The string to be 'chomped'</param>
        /// <returns type='String'> The 'chomped' string </returns>

        var character = str.charAt(str.length - 1);
        if (character === "&" || character === "?") {
            str = str.substring(0, str.length - 1);
        }
        return str;
    };

    // Dispatches error as custom event to window so that UET tag helper can catch
    this.throwError = function (errMsg) {
      // Check CustomEvent constructor browser compatibility, not supported in IE11
      if (typeof CustomEvent === 'function') {
        var errorObj = { errMsg: errMsg, tagId: initData.ti };
        var event = new CustomEvent("uetError", { detail: errorObj });
        window.dispatchEvent(event);
      }

      throw errMsg;
    };

    this.validateValue = function (name, value, allowedDecimalPlaces, maximumValue) {
        var result = 0;
        var modValue = value;
        var isInt = (allowedDecimalPlaces === undefined || allowedDecimalPlaces === 0) ? true : false;
        // ignore ','
        if (value.toString().indexOf(",") !== -1) {
            modValue = value.replace(/,/g, "");
        }
        result = parseFloat(modValue);
        // First isNaN is needed as parseFloat checks for any valid prefix in the passed string
        // Second isNaN to check if the parsed result is a number
        // Third check verifies that there is no decimal point in the case of an integer
        if (isNaN(modValue) || isNaN(result) || (isInt && result.toString().indexOf(".") !== -1)) {
            this.throwError(name + " should be " + (isInt ? "an integer" : "a number"));
        }
        if (result > maximumValue) {
            this.throwError(name + " cannot be greater than " + maximumValue);
        }
        else if (result < 0) {
            this.throwError(name + " cannot be less than 0");
        }
        else if (this.getDecimalPlaces(result) > allowedDecimalPlaces) {
            this.throwError(name + " cannot have more than " + allowedDecimalPlaces + " decimal places");
        }
        return result;
    };

    this.validateRegex = function (value, regex, error) {
        var result = (value === null || value === undefined) ? '' : value.toString();
        if (!result.match(regex)) {
            this.throwError(error);
        }
        return result;
    };

    this.encodeParameter = function (value) {
        var result = (value === null || value === undefined) ? '' : value.toString();
        // Html encode & and # characters. In the future we can encode other characters as needed e.g. the equals sign
        return result.replace(/&/gi, "%26").replace(/#/gi, "%23");
    };

    this._validateProdId = function (value) {
        if (value === null || value === undefined) {
            this.throwError(this.invalidProdIdException);
        }

        // Check to see if the prodid is 1-50 alphanumeric or hyphen characters
        // If prodid is assigned as a Number rather than a String, then
        //  1. the number should be a possitive integer or 0
        //  2. the maximum integer number allowed is 999999999999999934463,
        //     otherwise it'll become scientific notation like "1e+21", and thus not allowed
        return this.validateRegex(value, /^[a-zA-Z0-9\-]{1,50}$/, this.invalidProdIdException);
    };

    this.validateProdId = function (value) {
        var result = "";

        if (value instanceof Array) {
            for (index in value) {
                // Skip null / undefined elements in the array
                if (value[index] !== null && value[index] !== undefined) {
                    // Use comma to separate prodids
                    result += (result !== "") ? "," : "";
                    result += this._validateProdId(value[index]);
                }
            }

            if (result === "") {
                // Throw if there's not any prodid value in the array
                this.throwError(this.invalidProdIdException);
            }
        } else {
            result = this._validateProdId(value);
        }

        return result;
    };

    this.validatePageType = function (value, validPageTypeValues) {
        if (value === null || value === undefined) {
            this.throwError(this.invalidPageTypeException + value);
        }

        var result = value.toString();

        // Check to see if the pagetype is allowed in the list
        if (!validPageTypeValues[result]) {
            this.throwError(this.invalidPageTypeException + result);
        }

        return result;
    };

    this.getDecimalPlaces = function (number) {
        var floatForm = parseFloat(number);
        if (isNaN(number) || isNaN(floatForm)) {
            return 0;
        }
        var match = ('' + number).match(/(?:\.(\d+))?(?:[eE]([+-]?\d+))?$/);
        if (!match) {
          return 0;
        }
        return Math.max(
            0,
            // Number of digits right of decimal point.
            (match[1] ? match[1].length : 0)
            // Adjust for scientific notation.
            - (match[2] ? +match[2] : 0));
    };

    this.validateParameter = function (p, n, kp) {
        if (!n.match(/^[a-z_]{2,32}$/)) {
            this.throwError(p + ' invalid parameter name');
        }

        // FIXME: should we add default validations when none are defined?
        // default type is string (forced) with no validations
        if (kp.type == null || this.paramValidations[kp.type] == null) {
            return p.toString();
        }

        var v = this.paramValidations[kp.type];
        switch (v.type) {
            case 'regex':
                var errstr = v.error.replace('{p}', n);
                p = this.validateRegex(p, v.regex, errstr);
                break;
            case 'num':
                p = this.validateValue(n, p, v.digits, v.max);
                break;
            case 'enum':
                p = p.toString();
                if (kp.values.indexOf(p) === -1)
                    this.throwError(v.error.replace('{p}', n));
                break;
            case 'array':
                if (!(p instanceof Array) || p.length < 1)
                    this.throwError(v.error.replace('{p}', n));
                p = this.validateParameterArray(p, n);
                break;
            default:
                p = p.toString();
                break;
        }

        return p;
    };

    this.validateParameterArray = function (p, n) {
        for (var i in p)
        {
            // FIXME: push warning to JS console & UET Helper
            // skip if element is not an object
            if (typeof p[i] !== 'object')
                continue;

            // prefix in validation table is [name].[param]
            p[i] = this.validateSubparams(p[i], n + '.');

            // convert to &p=v
            p[i] = this.removeTrailingAmp(this.stringifyToRequest(p[i]));
        }

        // join array into string separated by commas
        return p.join(',');
    }

    this.validateSubparams = function (data, prefix)
    {
        // NOTE: current code is designed to only support one level (array of objects with only single typed params)
        // this is enforced by only allowing the whitelisted params, not following full traversal of objects
        // can be extended in the future if necessary

        // build a new object with valid results
        // this is in case an object with custom type is passed in
        var valid = {};

        // validate known parameters
        for (var p in data) {
            // FIXME: send error to JS console, G, warning to UET helper
            // drop any params that are unknown, null, or undefined
            if (!this.knownParams.hasOwnProperty(prefix + p) || data[p] == null) {
                continue;
            }

            var kp = this.knownParams[prefix + p];

            // validate/sanitize/reformat parameter
            // FIXME: add prefix to validation error messages
            var result = this.validateParameter(data[p], p, kp);

            if (typeof result === 'string' || result instanceof String) {
                // FIXME: send error to JS console, G, warning to UET helper
                // drop empty string parameters
                if (result === '') {
                    continue;
                }

                // percent encode all string parameters
                result = encodeURIComponent(result);
            }

            // set validated parameter
            // key is either beacon if defined (different key for UET log) or parameter name
            valid[kp.hasOwnProperty('beacon') ? kp['beacon'] : p] = result;
        }

        return valid;
    }

    this.validateDataObjectNew = function (evtType, data) {
        // FIXME: following 10 lines are shared with this.validateDataObject
        if (!evtType) {
            this.throwError(this.invalidEventException + "undefined event.");
        }
        if (evtType !== this.pageLoadEvt && evtType !== this.customEvt) {
            this.throwError(this.invalidEventException + evtType);
        }
        if (!data) {
            this.throwError("undefined data object passed to validate");
        }
        if (typeof data !== "object") {
            return;
        }

        // custom handling for required parameters - this should be made generic if more validations like this are added
        if (data.hasOwnProperty('ecomm_pagetype')) {
            if (data.hasOwnProperty('ecomm_prodid')) {
                data.ecomm_prodid = this.validateProdId(data.ecomm_prodid);
            }
        } else if (data.hasOwnProperty('ecomm_prodid')) {
            // If sending prodid without accompanying information (parameter "pagetype") in the UET event, it is not valid
            this.throwError(this.missingPageTypeException);
        }

        if (data.hasOwnProperty('hct_base_price') || data.hasOwnProperty('hct_booking_xref') || data.hasOwnProperty('hct_pagetype')
            || data.hasOwnProperty('hct_checkin_date') || data.hasOwnProperty('hct_checkout_date')
            || data.hasOwnProperty('hct_length_of_stay') || data.hasOwnProperty('hct_partner_hotel_id'))
        {
            // Hotel total price and currency must be sent if any other hotel parameters are sent
            if (!(data.hasOwnProperty('hct_total_price') && data.hasOwnProperty('currency'))) {
                this.throwError(this.missingHotelParametersException);
            }
        }

        // If hotel parameter and variable revenue cannot be sent together.
        if (data.hasOwnProperty('hct_total_price') && data.hasOwnProperty('gv'))
        {
            this.throwError(this.hotelVariableRevenueException);
        }

        // fill in top level page params
        var ea = data['event_action'];
        if (ea != null && this.knownEvents.hasOwnProperty(ea)) {
            var ke = this.knownEvents[ea];

            // add whitelisted params for this event that aren't set on the event
            for (var i in ke) {
                var p = ke[i];
                if (this.pageLevelParams.hasOwnProperty(p) && !data.hasOwnProperty(p))
                    data[p] = this.pageLevelParams[p];
            }
        }

        return this.validateSubparams(data, '');
    };

    this.validateDataObject = function (evtType, data) {
        if (!evtType) {
            this.throwError(this.invalidEventException + "undefined event.");
        }
        if (evtType !== this.pageLoadEvt && evtType !== this.customEvt) {
            this.throwError(this.invalidEventException + evtType);
        }
        if (!data) {
            this.throwError("undefined data object passed to validate");
        }
        if (typeof data !== "object") {
            return;
        }

        // legacy pageLoad event has no allowed parameters
        for (var i in data) {
            // valid keys for custom events
            if (evtType === this.customEvt &&
                (this.legacyValidCustomEventKeyNames[i] ||
                 this.ambiguousValidCustomEventKeyNames[i]))
                continue;

            // legacy pageLoad event has no allowed parameters

            this.throwError(this.invalidKeyException + i);
        }

        // Event value should be between 0 and 999999999999 with up to 3 decimal places
        if (data.hasOwnProperty("ev") > 0) {
            data.ev = this.validateValue("ev", data.ev, 3, 999999999999);
        }
        // Goal value should be between 0 and 999999999999 with up to 3 decimal places
        if (data.hasOwnProperty("gv") > 0) {
            data.gv = this.validateValue("gv", data.gv, 3, 999999999999);
        }

        // should be ISO standard currency code (an alphabetic string of exactly 3 characters)
        if (data.hasOwnProperty("gc") > 0) {
            data.gc = this.validateRegex(data.gc, /^[a-zA-Z]{3}$/, this.goalCurrencyFormatException);
        }
        // Encode user provided parameters, if they are not sent as null or undefined. Send ec2/ea2/el2 param if full encoding differs
        if (data.hasOwnProperty("ec") > 0 && data.ec !== null && data.ec !== undefined) {
            var ec2 = encodeURIComponent(data.ec);
            data.ec = this.encodeParameter(data.ec);
            if (data.ec !== ec2)
                data.ec2 = ec2;
        }
        if (data.hasOwnProperty("ea") > 0 && data.ea !== null && data.ea !== undefined) {
            var ea2 = encodeURIComponent(data.ea);
            data.ea = this.encodeParameter(data.ea);
            if (data.ea !== ea2)
                data.ea2 = ea2;
        }
        if (data.hasOwnProperty("el") > 0 && data.el !== null && data.el !== undefined) {
            var el2 = encodeURIComponent(data.el);
            data.el = this.encodeParameter(data.el);
            if (data.el !== el2)
                data.el2 = el2;
        }

        // new "ecomm_" prefix overrides old parameter names
        // still uses the old names w/o prefix in G UET call for pipeline to pick up
        if (data.hasOwnProperty("ecomm_prodid") > 0) {
            data.prodid = data.ecomm_prodid;
            delete data.ecomm_prodid;
        }
        if (data.hasOwnProperty("ecomm_pagetype") > 0) {
            data.pagetype = data.ecomm_pagetype;
            delete data.ecomm_pagetype;
        }

        if (data.hasOwnProperty("pagetype") > 0) {
            // Extensibility: When adding more verticals, like Hotel, we should ensure that
            // parameters that belong to other vertical don't exist
            // pagetype should be one of the follows: home, searchresults, category, product, cart, purchase, other
            data.pagetype = this.validatePageType(data.pagetype, this.validRetailPageTypeValues);

            if (data.hasOwnProperty("prodid") > 0) {
                // prodid should be alphanumeric, within 50 character limit
				// prodid is optional, no error if not sent.
                data.prodid = this.validateProdId(data.prodid);
            }
        } else if (data.hasOwnProperty("prodid") > 0) {
            // If sending prodid without accompanying information (parameter "pagetype") in the UET event, it is not valid
            this.throwError(this.missingPageTypeException);
        }
    };

    this.evt = function (evtType, action, data, autoOrLegacy) {
        if (autoOrLegacy == null)
            autoOrLegacy = true;

        // Multiple 'pageLoad' attempts should be ignored
        if (evtType === this.pageLoadEvt && this.pageLoadDispatch === true) {
            return;
        }

        data = data || {};

        // NOTE: sequence of these checks is important

        // 'data' should be of 'object' type, otherwise do not fire event
        if (typeof data !== "object") {
            return;
        }

        if (autoOrLegacy) {
            // fixed validation
            this.validateDataObject(evtType, data);
        } else if (evtType === this.customEvt) {
            // set param event_action based on top level argument
            data['event_action'] = action;

            // config table based validation
            data = this.validateDataObjectNew(evtType, data);
        }

        if (evtType === this.customEvt) {
            // Custom events should not fire with empty data
            var keys = [];
            for (var key in data) {
                keys.push(key);
            }
            if (keys.length === 0) {
                return;
            }

            // If this is a new style event, add flag for usage analysis
            if (!autoOrLegacy) {
                data['en'] = 'Y';
            }
        }

        // This will be needed in fireBeaconImg
        if (!this.invisibleDiv) {
            this.createInvisibleDiv(document.body);
        }

        data.evt = evtType;

        // Inside an iFrame?
        if (window.self != window.top) {
            data.ifm = 1;
        }

        // Include Session Id
        data = this.addSessionId(data);

        if (evtType === this.pageLoadEvt) {
            data = this.addPageData(data);
            this.pageLoadDispatch = true;
        }

        // Include MSCLKID
        data = this.addMsClkId(data);

        this.fireBeacon(data);

        // abf - Attempted beacon firing flag indicates if fireBeacon call was made or not
        data.abf = true;

        // process all events from global event queue, uetq, if the event is
        // 'pageLoad' and not already dispatched from another 'pageLoad' event
        if (evtType === this.pageLoadEvt && this.evqDispatch === false) {
            this.dispatchq();
        }
    };

    this.getCookie = function (cookieName, cookieValuePrefix, valueMaxLength) {
        if (!this.stringExists(cookieName) || !this.stringExists(cookieValuePrefix)) {
            return null;
        }

        var cookie = document.cookie;
        if (cookie.length === 0) {
            return null;
        }

        // Look for the cookie with the cookieName as well as a specific prefix in its value
        // That's to avoid getting an irrelevant cookie with the same name set at a subdomain
        var indexOfNameParam, start = 0;
        while (start < cookie.length) {
            // In the cooking string, look for the name parameter plus value prefix of the cookie wanted
            indexOfNameParam = cookie.indexOf(cookieName + "=" + cookieValuePrefix, start);

            if (indexOfNameParam < 0) {
                return null;
            }

            // Check if there's an unwanted prefix in the name parameter found
            if (indexOfNameParam > 0 && cookie[indexOfNameParam - 1] !== " " && cookie[indexOfNameParam - 1] !== ";") {
                // If there's an unwanted prefix in cookie name, then we need to do searching again
                // after the current occurrence
                start = indexOfNameParam + cookieName.length + 1;
            } else {
                // If the name parameter found starts at index 0 of the string
                // or there's no unwanted prefix, then we've found it successfully
                break;
            }
        }

        // Look for the end of the cookie wanted
        var indexOfEnd = cookie.indexOf(";", indexOfNameParam);
        indexOfEnd = indexOfEnd >= 0 ? indexOfEnd : cookie.length;

        var cookieValue = cookie.substring(indexOfNameParam + cookieName.length + 1 + cookieValuePrefix.length, indexOfEnd);
        if (cookieValue.length > valueMaxLength) {
            return null;
        }

        return cookieValue;
    };

    this._setCookie = function (cookieName, cookieValue, expUtc, domain) {
        document.cookie = cookieName + "=" + cookieValue + ";expires=" + expUtc + (domain ? ";domain=." + domain : "") + ";path=/";
    };

    this.setCookie = function (cookieName, cookieValue, expSecs, deleteFirst, cookieValuePrefix, valueMaxLength) {
        if (!this.stringExists(cookieName) || !this.stringExists(cookieValuePrefix)) {
            return null;
        }

        // Assumption: length of cookieValue should be 1 to valueMaxLength
        if (!this.stringExists(cookieValue) || cookieValue.length > valueMaxLength) {
            return null;
        }

        var date = new Date();
        date.setTime(date.getTime() + expSecs * 1000);

        var pastDate = new Date();
        pastDate.setTime(0);

        // Try to set cookie to the highest-level domain
        if (this.domainName === null || deleteFirst) {
            // We use hostname here because it does not include the port
            var domainName = document.location && document.location.hostname;
            if (domainName && typeof(domainName) === "string" && domainName !== "localhost") {
                var domainNameSplit = domainName.split('.');
                // The last part in a URL (like com or cn) can never be an allowed domain for setting cookies
                var rootDomain = domainNameSplit.pop();

                if (domainNameSplit.length === 3 && Number(rootDomain) >= 0) {
                    // If this is an IP address, then fall back to omit the domain parameter for the cookie
                    domainNameSplit = [];
                }

                while (domainNameSplit.length > 0) {
                    rootDomain = domainNameSplit.pop() + "." + rootDomain;

                    if (deleteFirst) {
                        // Try to delete cookie first if already exists
                        this._setCookie(cookieName, "", pastDate.toUTCString(), rootDomain);

                        // A successful deletion of the cookie also means that we have found the highest-level domain
                        deleteFirst = !!this.getCookie(cookieName, cookieValuePrefix, valueMaxLength);
                    }

                    // Try to set cookie to the current domain when it is deleted or it does not exist
                    if (!deleteFirst) {
                        this._setCookie(cookieName, cookieValuePrefix + cookieValue, date.toUTCString(), rootDomain);

                        if (this.getCookie(cookieName, cookieValuePrefix, valueMaxLength)) {
                            // Setting the cookie successfully means that we have found the highest-level domain
                            // We cache the root domain name in this case till next page load
                            this.domainName = rootDomain;
                            return;
                        }
                    }
                }
            }

            // If none of the attempts above succeeded, then omit the domain parameter for the cookie
            this.domainName = "";
        }

        // Fall-back here for 2 cases:
        //   1. If document.domain is empty or localhost
        //   2. If all attempts above fail to set cookie
        this._setCookie(cookieName, cookieValuePrefix + cookieValue, date.toUTCString(), this.domainName);
    };

    this.addSessionId = function (data) {
        if (initData.Ver < 2 || this.cookieAllowed === false) {
            // We only send the Session Id in the event for UET version 2 or higher
            return data;
        }

        // Try to get existing (not yet expired) cookie first.
        // If it exists, renew it. Otherwise, create it.
        var sessionId = this.getCookie(this.sessionCookieName, this.sessionCookieValuePrefix, this.lengthSid);

        var newsid = '0';
        if (!sessionId) {
            sessionId = this._S4() + this._S4();
            newsid = '1';
        }

        // The default length of a session is 30 minutes
        this.setCookie(this.sessionCookieName, sessionId, this.sessionExpirationTime, newsid === '0', this.sessionCookieValuePrefix, this.lengthSid);

        // Put the Session ID into data so that it can be sent with events
        // The Session ID is updated if the webpage is idle for too long (due to cookie expiration)
        // sid is a reserved parameter in data

        // We only add the parameter sid if the cookie is set successfully
        // and add a specific value 'N' in the parameter sid if browser disables cookie completely
        data.sid = (this.getCookie(this.sessionCookieName, this.sessionCookieValuePrefix, this.lengthSid) === sessionId) ? sessionId + '-' + newsid : 'N';

        return data;
    };

    // Function to parse URL and get a specific parameter value via parameter name
    this.getQueryParam = function (url, paramName) {
        // url should not be empty, and paramName should not contain invalid characters
        // Returning null in that case
        if (!this.stringExists(url) || !this.stringExists(paramName) || /[^\d\w]/.exec(paramName)) {
            return null;
        }

        // Try to decode the url since normally the given url encoded
        try {
            url = decodeURIComponent(url);
        } catch (e) {
            // In case that the url is not encoded, we use it as is
        }

        // The expression aligns with function $.advertiser.getUrlParameter in
        // /private/UI/StaticResources/Advertiser/StaticResourcesWeb/Application/Scripts/advertiser.common.js
        // except for only matching '?' and '&', but not matching '\' at the beginning
        var regExp = new RegExp('[?&]' + paramName + '=([^&#]*)', 'i');
        var match = regExp.exec(url) || [, null];

        // Return the value of parameter in query string
        return match[1];
    };

    this.addMsClkId = function (data) {
        if (initData.Ver < 2 || this.cookieAllowed === false) {
            // We only send the Session Id in the event for UET version 2 or higher
            return data;
        }

        // Try to get MSCLKID from query string first
        // This populates this.msClkId by extracting parameter msclkid from URL query string if not yet
        // If there's no parameter msclkid in URL query string, the resulting this.msclkid will be null
        this.extractMsClkId(this.addUrlData({}));

        var newMsClkId = '0';

        if (this.stringExists(this.msClkId)) {
            // When the MSCLKID got in URL query string is different from the one in cookie, or there's no MSCLKID existing in cookie
            // the MSCLKID is considered a 'New' one, so we add '-1' at the end of the msclkid parameter in the event.
            // Otherwise, '-0' is added instead.
            if ((this.getCookie(this.msClkIdCookieName, this.msClkIdCookieValuePrefix, this.lengthMsClkId) !== this.msClkId)) {
                newMsClkId = '1';
            }
        } else {
            // Try to get existing (not yet expired) cookie first.
            // If it exists, renew it. Otherwise, we don't have an MSCLKID.
            this.msClkId = this.getCookie(this.msClkIdCookieName, this.msClkIdCookieValuePrefix, this.lengthMsClkId);
        }

        if (this.stringExists(this.msClkId)) {
            // The default msclkid expiration time is 90 days
            // The MSCLKID is purged if the webpage is idle for too long (due to cookie expiration at 90 days)

            // Set the cookie if there's a new msclkid from URL query sting
            // Renew the cookie expiration time if the existing msclkid is used in an event again
            // Always try to delete related cookie first
            this.setCookie(this.msClkIdCookieName, this.msClkId, this.msClkIdExpirationTime, true, this.msClkIdCookieValuePrefix, this.lengthMsClkId);

            // We add an 'N' to the end of the value of parameter msclkid if the cookie is not set successfully
            // so that we know 1st-party cookie is disabled, or 3rd-party cookie is disabled in an iframe tag management solution scenario
            if (this.getCookie(this.msClkIdCookieName, this.msClkIdCookieValuePrefix, this.lengthMsClkId) !== this.msClkId) {
                newMsClkId += 'N';
            }

            // Put the MSCLKID into data so that it can be sent with events
            // msclkid is a reserved parameter in data
            // We always include msclkid parameter when it exists in URL query string or cookie
            // regardless whether it's successfully set to 1st-party cookie or not
            data.msclkid = encodeURIComponent(this.msClkId + '-' + newMsClkId);
        } else {
            // We use a specific value 'N' in the parameter msclkid if MSCLKID doesn't exist in URL query string and cookie
            // Cookie can also be missing if 1st-party is disabled or 3rd-party cookie is disabled in an iframe tag management solution scenario
            // In other words, there is no available MSCLKID to add to the event
            data.msclkid = 'N';
        }

        return data;
    };

    ////
    //// The entire section below this is to post data to the server instead of using get
    this.createIframe = function (parent) {
        /// <summary> Creates an invisible IFRAME element on the DOM </summary>
        /// <param name='parent' type='DOMElement'> The HTML under which the new IFRAME element is created </param>
        /// <returns type='DOMElement'> The DOM element that is created </returns>

        this.invisibleFrame = this.createInvisibleElement(parent, "iframe");
        this.invisibleFrame.src = "";
        this.invisibleFrame.name = this.invisibleFrame.id;
        return this.invisibleFrame.id;
    };

    this.clone = function (obj, dest) {
        /// <summary> Clones the src object and returns the destination either by compositing or creating a new object </summary>
        /// <param name='src' type='Object'> Source object </param>
        /// <param name='dest' type='Object'> destination object </param>
        /// <returns type='Object'> destination object </returns>
        if (dest === undefined) {
            dest = {};
        }
        for (var attr in obj) {
            if (obj.hasOwnProperty(attr)) {
                dest[attr] = obj[attr];
            }
        }
        return dest;
    };

    this.combine = function (obj1, obj2) {
        /// <summary> Clones the src object and returns the destination either by compositing or creating a new object </summary>
        /// <param name='src' type='Object'> Source object </param>
        /// <param name='dest' type='Object'> destination object </param>
        /// <returns type='Object'> destination object </returns>

        var cloned = this.clone(obj1);
        if (cloned.alt) {
          delete cloned.alt;
        }
        cloned = this.clone(obj2, cloned);
        return cloned;
    };

    this.addHiddenFields = function (params, form, ifrm, name) {
        /// <summary> Adds hidden fields to a form to submit </summary>
        /// <param name='parmas' type='Object'> Source object to submit </param>
        /// <param name='form' type='HTMLForm'> Form under which the hidden elements are created </param>
        /// <param name='ifrm' type='HTMLDom'> The DOM under which the objects are created </param>
        /// <param name='name' type='String'> A prefix name that is added to every field key </param>
        /// <returns type='Object'> destination object </returns>
        var prefix = "";
        if (name) {
            prefix = name + ".";
        }

        for (var key in params) {
            if (params.hasOwnProperty(key)) {
                if (typeof params[key] === "object") {
                    this.addHiddenFields(params[key], form, ifrm, prefix + key);
                } else {
                    var hiddenField = ifrm.createElement("input");
                    hiddenField.setAttribute("type", "hidden");
                    hiddenField.setAttribute("name", prefix + key);
                    hiddenField.setAttribute("value", params[key]);

                    form.appendChild(hiddenField);
                }
            }
        }
    };

    this.fireBeacon = function (params) {
        var localUrlPrefix = this.urlPrefix;
        var localPostUrl = this.postURL;

        var data = this.combine(initData, params);
        var str = this.stringifyToRequest(data);
        var url = this.removeTrailingAmp(localUrlPrefix + str);

        // el2: Encoded event label, for analysis only safe to drop
        // ec2: Encoded event category, for analysis only safe to drop
        // ea2: Encoded event action, for analysis only safe to drop
        // kw:  If url length is over limit, we will remove the metadata keywords tags which can be potentially long
        // p:   If url length still over limit, remove the p param from url, pipeline will use referral url in the absence of p.
        // tl:  If url length still over limit, remove the tl param from url.
        //      The page title is used to extract the information for targeting, which should be in the event for normal cases.
        //      But if the title is too long and cause the overall length over the limit, we can choose the less bad option
        //      to not pass the title if the overall querystring length is about over the limit.
        var trimList = [ 'el2', 'ec2', 'ea2', 'kw', 'p', 'tl' ];

        for (var trimIdx = 0; encodeURI(url).length > this.URLLENGTHLIMIT && trimList.length > trimIdx; trimIdx++) {
            var trimItem = trimList[trimIdx];
            if (!(trimItem in data))
                continue;

            if (trimIdx <= 2)
            {
                // for el2/ec2/ea2 only: truncate param rather than removing
                data[trimItem] = '';
            } else {
                // remove param entirely
                delete data[trimItem];
            }

            str = this.stringifyToRequest(data);
            url = this.removeTrailingAmp(localUrlPrefix + str);
        }

        // TODO: handle when length is still >4k. Need to drop more params, use POST, or preferably use the beacon API

        this.fireBeaconImg(url);
    };
}