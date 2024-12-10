    function Ane() {
        var e;
        !function() {
            const e = (0,
            b.P)(A.dc)
              , t = (0,
            b.P)(xt.fy)
              , [n] = (0,
            b.P)(et.V4)
              , i = (0,
            c.useCallback)((n => {
                e && t(n)
            }
            ), [e, t]);
            (0,
            c.useEffect)(( () => {
                i(Op.oo.PAGE_LOAD);
                const e = () => i(Op.oo.ONLINE);
                return window.addEventListener("online", e),
                () => {
                    window.removeEventListener("online", e)
                }
            }
            ), [i]);
            const r = (0,
            c.useCallback)((e => {
                i("visibilitychange" === e ? Op.oo.VISIBILITY_CHANGE : Op.oo.PAGE_FOCUS)
            }
            ), [i]);
            (0,
            c.useEffect)(( () => {
                Array.from(n).some(( ([e,t]) => t === $f.Y.ACCEPTED)) && i(Op.oo.FRIEND_STATUS_CHANGE)
            }
            ), [n, i]),
            (0,
            dt.W)(r)
        }(),
        Cn(),
        rm(),
        function() {
            const [e,t] = (0,
            b.P)(T_.ag);
            (0,
            c.useEffect)(( () => (e(),
            t)), [e, t])
        }(),
        function() {
            const e = (0,
            c.useCallback)(( () => {
                (async () => {
                    try {
                        const e = await async function() {
                            const e = new Request(Yl,{
                                method: "POST"
                            });
                            return (0,
                            Wl.s)(e)
                        }();
                        e.ok || (e.status,
                        e.statusText)
                    } catch (e) {}
                }
                )()
            }
            ), []);
            lt({
                onRefresh: e,
                immediate: !0,
                intervalMs: $l + Math.round(Math.random() * jl * 2 - jl)
            })
        }(),
        function() {
            const e = [...(0,
            b.P)((e => e.talk.sessions)).values()].map((e => e.sessionState.localParticipant.callState)).filter((e => e !== Vi.i.None)).length > 0
              , {disposeAudio: t, ensureAudioForCall: n} = (0,
            b.P)((e => e.media.local));
            (0,
            c.useEffect)(( () => t), [t]),
            (0,
            c.useEffect)(( () => {
                e ? n() : t()
            }
            ), [e, t, n])
        }(),
        (0,
        c.useEffect)(( () => {
            "serviceWorker"in navigator && async function() {
                const e = await async function() {
                    const e = (await navigator.serviceWorker.ready).active;
                    if (!e)
                        throw Error("No active service worker");
                    return e
                }();
                navigator.serviceWorker.addEventListener("message", Xl),
                e.postMessage({
                    type: "PENDING_CALLS_REQUEST"
                }),
                (0,
                Kl.hi)()
            }().catch((e => {}
            ))
        }
        ), []),
        wt("home_page", {
            shouldTrackInitialRenderTime: !0
        }),
        function() {
            const e = (0,
            L.i)(w.ON)
              , t = (0,
            b.P)(M.qC);
            (0,
            c.useEffect)(( () => {
                if (e) {
                    const e = e => Boolean(e)
                      , n = window.setInterval(( () => {
                        const n = t.filter(e)
                          , i = new Set(n.map((e => e.id)))
                          , r = [...up.l2.values()].filter((e => !i.has(e.id)));
                        for (const e of r)
                            (0,
                            up.d_)(e.id)
                    }
                    ), 5e3);
                    return () => clearInterval(n)
                }
            }
            ), [t, e])
        }(),
        function() {
            const e = (0,
            h.zy)()
              , t = (0,
            b.P)(G.DC)
              , n = (0,
            b.P)(B.EN);
            (0,
            c.useEffect)(( () => {
                n.size || t()
            }
            ), [t, e.pathname, n.size])
        }(),
        (0,
        Gl.k)(),
        (0,
        c.useEffect)(( () => {
            const e = e => {
                const t = e;
                for (const e of t.fontfaces)
                    P().increment({
                        metricsName: "font_load_failure",
                        dimensions: {
                            family: e.family,
                            style: e.style,
                            weight: e.weight
                        }
                    })
            }
            ;
            return document.fonts.addEventListener("loadingerror", e),
            () => {
                document.fonts.removeEventListener("loadingerror", e)
            }
        }
        ), []),
        function() {
            const e = (0,
            c.useRef)(0)
              , [t,n] = (0,
            b.P)(jt.RW, R);
            (0,
            c.useEffect)(( () => {
                const i = () => {
                    Date.now() - e.current < Kt ? n(zt.O.Present) : n(zt.O.AwaitingReactivate)
                }
                  , r = () => {
                    n(zt.O.Present)
                }
                  , o = () => {
                    document.hasFocus() || (t === zt.O.Present && (e.current = Date.now()),
                    n(zt.O.Away))
                }
                ;
                return document.hasFocus() || o(),
                window.addEventListener("click", r, {
                    capture: !0
                }),
                window.addEventListener("focus", i),
                window.addEventListener("blur", o),
                () => {
                    window.removeEventListener("click", r, {
                        capture: !0
                    }),
                    window.removeEventListener("focus", i),
                    window.removeEventListener("blur", o)
                }
            }
            ), [n, t, e])
        }(),
        function() {
            const [e,t] = (0,
            b.P)(jt.wm)
              , n = (0,
            c.useRef)({
                shiftKey: !1,
                metaKey: !1,
                ctrlKey: !1
            })
              , i = (0,
            c.useCallback)(( () => {
                const {shiftKey: e, metaKey: i, ctrlKey: r} = n.current;
                e && (i || r) || t(!1)
            }
            ), [t]);
            (0,
            c.useEffect)(( () => {
                const e = e => {
                    "button"in e && 2 === e.button || (n.current = {
                        shiftKey: e.shiftKey,
                        metaKey: e.metaKey,
                        ctrlKey: e.ctrlKey
                    },
                    i())
                }
                  , r = () => t(!0)
                  , o = t => {
                    e(t),
                    (t.shiftKey && (t.metaKey || t.ctrlKey) || "PrintScreen" === t.key) && r()
                }
                ;
                return window.addEventListener("contextmenu", r),
                window.addEventListener("keydown", o),
                window.addEventListener("keyup", e),
                window.addEventListener("mousedown", e),
                () => {
                    window.removeEventListener("contextmenu", r),
                    window.removeEventListener("keydown", o),
                    window.removeEventListener("keyup", e),
                    window.removeEventListener("mousedown", e)
                }
            }
            ), [i, t])
        }(),
        function() {
            const e = Ke(Te)
              , t = (0,
            b.P)(et.$d);
            s_("sync_trigger", (0,
            c.useCallback)((n => {
                const i = Xv.decode(n)
                  , r = i.payload?.$case ?? "missing_payload";
                P().increment({
                    metricsName: "sync_trigger_attempt",
                    dimensions: {
                        type: r
                    }
                }),
                (async () => {
                    try {
                        if ("supSyncPayload" === r)
                            await e("duplex_trigger");
                        else {
                            if ("coreDataSyncPayload" !== r)
                                return void P().increment({
                                    metricsName: "sync_trigger_skip_unhandled",
                                    dimensions: {
                                        type: r
                                    }
                                });
                            await t("duplex_trigger")
                        }
                        P().increment({
                            metricsName: "sync_trigger_success",
                            dimensions: {
                                type: r
                            }
                        })
                    } catch (e) {
                        P().increment({
                            metricsName: "sync_trigger_failure",
                            dimensions: {
                                type: r
                            }
                        })
                    }
                }
                )()
            }
            ), [e, t]))
        }(),
        function() {
            const e = (0,
            b.P)(T_.H_)
              , t = (0,
            c.useCallback)((async t => {
                const n = performance.now();
                let i, r;
                try {
                    const e = u_.decode(t);
                    if (e.deviceType !== m_.b.DESKTOP_WEB)
                        return void P().increment({
                            metricsName: "duplex_pns_non_web_device_type"
                        });
                    const n = (new TextDecoder).decode(e.json);
                    i = JSON.parse(n);
                    const r = (0,
                    g_.nU)(i.type)
                      , o = f_.u[r];
                    P().increment({
                        metricsName: "duplex_pns_parse_success",
                        dimensions: {
                            type: o || i.type
                        }
                    })
                } catch (e) {
                    return void P().increment({
                        metricsName: "duplex_pns_parse_failed"
                    })
                }
                if (await (0,
                v_.p)(i, !1, p_.Y7.RECEIVED)) {
                    if (void 0 !== i.duplex_process_deadline) {
                        const e = parseInt(i.duplex_process_deadline)
                          , t = performance.now() - n;
                        if (t > e)
                            return P().increment({
                                metricsName: "duplex_pns_ack_too_slow",
                                dimensions: {
                                    deadline: i.duplex_process_deadline
                                }
                            }),
                            void P().addHistogram({
                                metricsName: "duplex_pns_ack_amount_past_deadline",
                                value: Math.round(t - e)
                            })
                    }
                    try {
                        r = (0,
                        __.o)((0,
                        g_.ex)(i))
                    } catch (e) {
                        return void P().increment({
                            metricsName: "notifications.invalid_payload",
                            dimensions: {
                                type: i.type || "unknown_type"
                            }
                        })
                    }
                    r.options.data.type === f_.u.UNKNOWN_TYPE && P().increment({
                        metricsName: "push_notifications_unknown_type"
                    });
                    try {
                        if ((0,
                        U.Nz)()) {
                            const e = await navigator.serviceWorker.ready
                              , t = await async function(e, t) {
                                const n = await t.getNotifications();
                                for (const t of n) {
                                    const n = t.data;
                                    if (n) {
                                        if ((0,
                                        g_.Ho)(e, n)) {
                                            P().increment({
                                                metricsName: "notifications.revoke"
                                            }),
                                            t.close();
                                            break
                                        }
                                        if (e.n_key === n.n_key)
                                            for (const [t,i] of n.grouped_senders.entries())
                                                e.grouped_senders.has(t) || e.grouped_senders.set(t, i)
                                    } else
                                        P().increment({
                                            metricsName: "notifications.lost_payload.on_push_event"
                                        }),
                                        t.close()
                                }
                                if ((0,
                                g_.PY)(e)) {
                                    const t = (0,
                                    g_.lO)(e);
                                    if (t)
                                        return P().addHistogram({
                                            metricsName: "notifications.grouped_notification.size",
                                            value: e.grouped_senders.size
                                        }),
                                        t
                                }
                            }(r.options.data, e);
                            t && (r.options.body = t)
                        }
                    } catch (e) {
                        P().increment({
                            metricsName: "push_notifications_process_existing_error"
                        })
                    }
                    try {
                        await e({
                            type: "DISPLAY_PUSH_NOTIFICATION",
                            data: r,
                            isClientResponsibleForDisplay: !0,
                            analyticsPayload: {
                                n_id: i.n_id,
                                type: i.type,
                                sender_username: i.sender_username,
                                sent_ts: i.sent_ts,
                                dt_data: i.dt_data,
                                dt_token: i.dt_token,
                                display_tracking_token: i.display_tracking_token
                            }
                        }, "duplex_listener")
                    } catch (e) {
                        P().increment({
                            metricsName: "push_notifications_display_error"
                        })
                    }
                } else
                    P().increment({
                        metricsName: "duplex_pns_receive_ack_failed"
                    })
            }
            ), [e]);
            s_("pns", t)
        }();
        const t = function() {
            const {showToast: e, activeToasts: t, hideToast: n} = sE()
              , i = (0,
            Ot.A)()
              , r = "offline";
            return (0,
            c.useEffect)(( () => {
                const t = () => {
                    e({
                        key: r,
                        type: aE.Neutral,
                        timeout: 5e3,
                        content: i.formatMessage({
                            id: "y3LYEt",
                            defaultMessage: [{
                                type: 0,
                                value: "Could not connect to the internet."
                            }]
                        })
                    })
                }
                  , o = () => {
                    n(r)
                }
                ;
                return window.addEventListener("online", o),
                window.addEventListener("offline", t),
                () => {
                    window.removeEventListener("online", o),
                    window.removeEventListener("offline", t)
                }
            }
            ), [e, n, i]),
            t
        }()
          , n = (0,
        Ee.vH)()
          , r = (0,
        Ee.PR)()
          , o = (0,
        b.P)(xt.QF)
          , a = (0,
        b.P)(xt.ud)
          , s = (0,
        h.zy)()
          , d = (0,
        qf.K)(s.pathname)
          , l = void 0 !== d
          , u = (0,
        Jl.QB)()
          , p = l ? "secondary" : "main"
          , f = (0,
        b.P)((e => e.games.isGamesOpen));
        (0,
        c.useEffect)(( () => {
            l ? a || o("DEEPLINK") : o()
        }
        ), [l, o, a]);
        const {ongoingCallConversationId: m, incomingCallConversationId: v} = gm()
          , _ = ym(v)
          , E = (0,
        b.P)(A.cJ)
          , [g,T] = (0,
        b.P)(T_.cE)
          , {modalState: S, toggleFriendRequestModal: I, toggleCreateConversationModal: y} = RP();
        (0,
        c.useEffect)(( () => {
            E && "granted" === Notification.permission && (0,
            Vl.M)(A_.d.RequestInBackground)
        }
        ), [E]);
        const [N,O] = (0,
        c.useState)();
        (0,
        c.useEffect)(( () => {
            const e = v && (0,
            Qe.QA)(v)
              , t = m && (0,
            Qe.QA)(m);
            e || t || !N ? e && _ === Vi.i.Incoming ? O(e) : t && t === N && O(void 0) : (P().increment({
                metricsName: "calling.missed_call"
            }),
            O(void 0))
        }
        ), [v, _, m, N]);
        const C = s9(a9.compactContentMediaQuery)
          , k = (0,
        Q.Ff)()
          , D = k === ee.U.Lightbox
          , F = k === ee.U.Spotlight
          , x = void 0 !== m
          , V = F && x
          , W = F && C
          , H = "enabled" === (0,
        Bf.t)("DWEB_SNAPCHAT_ONBOARDING_EXPERIENCE", "disabled")
          , Y = function(e, t, n, i, r, o) {
            return t === ee.U.Spotlight && i ? "justMain" : [e, t !== ee.U.None, n, r, o].filter(Boolean).length > 1 || t === ee.U.Spotlight ? "mainAndSecondary" : e ? "justSecondary" : (ee.U.None,
            "justMain")
        }(x, k, Boolean(l), C, u, f)
          , $ = function(e, t, n, i, r) {
            return t === ee.U.None || t === ee.U.Spotlight && i ? "none" : t === ee.U.Spotlight ? "secondary" : e ? "main" : n || r ? "secondary" : "main"
        }(x, k, Boolean(l), C, u)
          , j = D || x || u
          , z = tne || (tne = (0,
        i.A)(h.C5, {
            to: "/",
            replace: !0
        }));
        !function(e) {
            const t = ym(e)
              , n = Im.includes(t);
            Em(n),
            (0,
            c.useEffect)(( () => (n && (window.addEventListener("beforeunload", Zl.tc),
            window.addEventListener("unload", Zl.eJ)),
            () => {
                window.removeEventListener("unload", Zl.eJ),
                window.removeEventListener("beforeunload", Zl.tc)
            }
            )), [n])
        }(m);
        const K = em(m)
          , q = K && d && m && d === m && !V
          , Z = !Zv((e => e.isPanelOpen)) && !1
          , X = Zv((e => e.isPanelOpen)) && !1
          , J = (0,
        L.i)(w.lr) && !1
          , [te,ne] = (0,
        c.useState)(!1);
        iE(Nu().ShowHotkeysHelp, (0,
        c.useCallback)(( () => ne((e => !e))), []), {
            enableOnContentEditable: !0,
            enableOnFormTags: ["INPUT", "TEXTAREA", "SELECT"]
        });
        const ie = function() {
            const e = (0,
            c.useRef)(null)
              , t = (0,
            c.useRef)(null);
            return (0,
            c.useMemo)(( () => ({
                createConversationToggleRef: e,
                friendRequestModalToggleRef: t
            })), [e, t])
        }()
          , [re] = Yf(Ve.HAS_USED_DWEB);
        !function() {
            const {ongoingCallConversationId: e, incomingCallConversationId: t} = gm()
              , n = (0,
            b.P)((0,
            B.zF)(e))
              , [i,r] = (0,
            c.useState)(void 0 !== t);
            (0,
            c.useEffect)(( () => () => r(Boolean(t))), [t]),
            (0,
            c.useEffect)(( () => {
                const o = i && !t;
                e && cp(n) && o && ((0,
                Zl.Jf)(e, !1),
                (0,
                Zl.Jf)(e, !0),
                r(!1))
            }
            ), [e, i, t, n])
        }();
        const {setNotificationsPreference: oe} = y_()
          , {isOpen: se} = (0,
        b.P)(de)
          , ce = b_.T.use.isDisplayingBrowserPrompt()
          , le = Hv.use.init();
        (0,
        c.useEffect)(( () => {
            le()
        }
        ), [le]);
        const {closeFullscreenMediaPlayer: ue} = (0,
        Q.sI)()
          , fe = TE({
            onClickOutside: (0,
            c.useCallback)(( () => {
                se || ue(ee.U.Spotlight)
            }
            ), [se, ue])
        })
          , {openFullscreenMediaPlayer: me} = (0,
        Q.sI)()
          , ve = (0,
        b.P)(pe);
        (0,
        c.useEffect)(( () => {
            (async () => {
                r && (!await ve() || l || C || me({
                    playerType: ee.U.Spotlight,
                    openCallback: e => e("DEFAULT", !0)
                }))
            }
            )()
        }
        ), [r]);
        const _e = (0,
        b.P)(ae);
        return (0,
        c.useEffect)(( () => {
            l && _e && ue(ee.U.Spotlight)
        }
        ), [ue, l, _e]),
        !1 === re ? H ? nne || (nne = (0,
        i.A)(J4, {})) : ine || (ine = (0,
        i.A)(I4, {})) : (0,
        i.A)("div", {
            className: (0,
            rt.A)(Rte.appLayout, J && Rte.needIntl)
        }, void 0, (0,
        i.A)(NP.Provider, {
            value: ie
        }, void 0, n && (rne || (rne = (0,
        i.A)(d_, {}))), one || (one = (0,
        i.A)(z7, {})), ce && (0,
        i.A)("div", {
            className: Rte.deemphasized
        }), (0,
        i.A)(nN, {}, void 0, (0,
        i.A)(tN, {
            id: wv.WG.NotificationsHeadsupModal
        }, void 0, (0,
        i.A)(w8, {
            onClickConfirm: () => {
                oe(!0, "feed")
            }
            ,
            onClickOutside: () => {
                T(A_.d.PermissionIsSet)
            }
        })), (0,
        i.A)(tN, {
            id: wv.WG.NotificationOsUpsell
        }, void 0, ane || (ane = (0,
        i.A)(x8, {}))), (0,
        i.A)(tN, {
            id: wv.WG.NotificationsRetargetingUpsell
        }, void 0, sne || (sne = (0,
        i.A)(V8, {}))), (0,
        i.A)(tN, {
            id: wv.WG.AdsManagerUpsell
        }, void 0, cne || (cne = (0,
        i.A)(N8, {})))), dne || (dne = (0,
        i.A)(zT, {})), lne || (lne = (0,
        i.A)(X8, {})), une || (une = (0,
        i.A)($8, {})), (0,
        i.A)("div", {
            className: (0,
            rt.A)(Rte.sidebar)
        }, void 0, (0,
        i.A)(h.BV, {
            location: s
        }, void 0, Kf.EC.map((t => (0,
        i.A)(h.qh, {
            path: t,
            element: e || (e = (0,
            i.A)(Pte, {
                modalState: S,
                toggleFriendRequestModal: I,
                toggleCreateConversationModal: y
            }))
        }, t))))), (0,
        i.A)("div", {
            className: (0,
            rt.A)(u ? Rte.plazaContentContainer : Rte.contentContainer, q ? Rte.headerAndContent : Rte.justContent)
        }, void 0, (0,
        i.A)(lE, {
            className: Rte.toastContainer,
            activeToasts: t,
            topOffset: 16
        }), K && (0,
        i.A)(s5, {
            conversation: K,
            hideHeader: !q
        }), (0,
        i.A)(Dl.div, {
            className: Rte.content,
            variants: C ? Dte : Mte(F, u),
            animate: Y,
            transition: {
                ease: "easeOut",
                duration: 0,
                when: "beforeChildren",
                gap: {
                    duration: 0
                },
                [C ? "gridTemplateColumns" : "gridTemplateRows"]: {
                    duration: 0
                }
            },
            initial: !1
        }, void 0, u && (0,
        i.A)("div", {
            className: (0,
            rt.A)({
                main: Rte.plazaInMain,
                secondary: Rte.plazaInSecondary
            }[p])
        }, void 0, pne || (pne = (0,
        i.A)(Nv, {}))), ("main" !== $ || F) && (0,
        i.A)("div", {
            className: Rte.main
        }, void 0, (0,
        i.A)(Bl, {
            mode: "wait",
            initial: !1
        }, void 0, (0,
        i.A)(h.BV, {
            location: s
        }, s.pathname, (0,
        i.A)(h.qh, {
            path: Kf.aE,
            element: l ? !V && (0,
            i.A)(A1, {
                conversationId: d,
                hideHeader: Boolean(q)
            }) : z
        }), Kf.GU.map((e => (0,
        i.A)(h.qh, {
            path: e,
            element: j ? void 0 : fne || (fne = (0,
            i.A)(LandingPage, {}))
        }, e))), (0,
        i.A)(h.qh, {
            index: !0,
            element: j ? void 0 : mne || (mne = (0,
            i.A)(LandingPage, {}))
        }), vne || (vne = (0,
        i.A)(h.qh, {
            path: "*",
            element: (0,
            i.A)(h.C5, {
                to: "/",
                replace: !0
            })
        }))))), u && f && (0,
        i.A)("div", {
            className: Rte.games
        }, void 0, _ne || (_ne = (0,
        i.A)(Gte, {})), hne || (hne = (0,
        i.A)(Ine, {}))), Ene || (Ene = (0,
        i.A)(eN, {})), m && (0,
        i.A)("div", {
            className: (0,
            rt.A)(F ? Rte.outgoingCallInMain : Rte.outgoingCallInSecondary)
        }, (0,
        Qe.QA)(m), K && F && (0,
        i.A)(s5, {
            conversation: K,
            hideHeader: !q
        }), (0,
        i.A)(Y7, {
            conversationId: m,
            hideHeader: Boolean(q)
        })), v && (0,
        i.A)("div", {
            className: Rte.callViewFloating,
            onClick: () => {
                O(void 0)
            }
        }, (0,
        Qe.QA)(v), (0,
        i.A)(Y7, {
            conversationId: v
        })), S.friendRequestModalOpen && (0,
        i.A)("div", {
            className: Rte.createConversationModalFloating
        }, void 0, (0,
        i.A)(H$, {
            toggleModal: I
        })), S.createConversationModalOpen && (0,
        i.A)("div", {
            className: Rte.createConversationModalFloating
        }, void 0, (0,
        i.A)(o9, {
            toggleModal: y
        })), ("none" !== $ || W) && (0,
        nt.jsxs)("div", {
            className: (0,
            rt.A)(Rte.fullScreenMediaPlayer, W && Rte.compactSpotlightFeed, {
                main: Rte.fullScreenMediaPlayerInMain,
                secondary: Rte.fullScreenMediaPlayerInSecondary
            }[$]),
            ref: W ? fe : void 0,
            children: [F && (gne || (gne = (0,
            i.A)(fX, {}))), D && (Tne || (Tne = (0,
            i.A)(p8, {})))]
        }))), te && (0,
        i.A)(J3, {
            close: () => ne(!1)
        }), !1, !1, Z && (0,
        i.A)(H3, {
            className: Rte.devToolPanelButton
        }), X && (Sne || (Sne = (0,
        i.A)(G3, {})))))
    }