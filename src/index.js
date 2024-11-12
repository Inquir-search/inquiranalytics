export default function analyticsTracker({
    token
}) {
    const getSessionId = () => {
        if (!window) return;
        let sessionId = window.sessionStorage.getItem("session_id");
        if (!sessionId) {
            sessionId = crypto.randomUUID();
            sessionStorage.setItem("session_id", sessionId);
        }
        return sessionId;
    };

    const sessionId = getSessionId();
    const recordedScreenWidth = window.innerWidth;
    const recordedScreenHeight = window.innerHeight;
    let isProgrammaticScroll = false;

    function throttle(func, delay) {
        let lastCall = 0;
        return function (...args) {
            const now = Date.now();
            if (now - lastCall >= delay) {
                lastCall = now;
                func.apply(this, args);
            }
        };
    }

    function sendToAnalyticsAPI(eventType, data) {
        const eventPayload = {
            event: {
                event: eventType,
                time: new Date().toISOString(),
                data: {
                    ...data,
                    screenWidth: recordedScreenWidth,
                    screenHeight: recordedScreenHeight,
                    sessionId: sessionId,
                },
            },
            indexName: "events-tracker-1731331138860",
        };

        fetch("https://platform.inquir.org/api/analytics/addEvent", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                Authorization: `Bearer ${token}`,
            },
            body: JSON.stringify(eventPayload),
        }).catch((error) => console.error("Analytics API error:", error));
    }

    const throttleInterval = 400;

    const throttledMousemove = throttle((event) => {
        sendToAnalyticsAPI("mousemove", {
            x: event.clientX,
            y: event.clientY,
            timestamp: Date.now(),
        });
    }, throttleInterval);

    const throttledScroll = throttle(() => {
        if (isProgrammaticScroll) {
            isProgrammaticScroll = false;
            return;
        }
        sendToAnalyticsAPI("scroll", {
            scrollTop: window.scrollY,
            timestamp: Date.now(),
        });
    }, throttleInterval);

    const handleClick = (event) => {
        sendToAnalyticsAPI("click", {
            x: event.clientX,
            y: event.clientY,
            timestamp: Date.now(),
        });
    };

    const handlePointerDown = (event) => {
        sendToAnalyticsAPI("pointerdown", {
            x: event.clientX,
            y: event.clientY,
            timestamp: Date.now(),
        });
    };

    const scrollMessageListener = (event) => {
        event.stopPropagation();
        event.preventDefault();

        const { type, scrollTop } = event.data;
        if (type === 'scroll' && typeof scrollTop === 'number') {
            isProgrammaticScroll = true;
            window.scrollTo(0, scrollTop);
            console.log(`Iframe scrolled to position: ${scrollTop}`);
        }
    };

    document.addEventListener("mousemove", throttledMousemove);
    document.addEventListener("scroll", throttledScroll);
    document.addEventListener("click", handleClick);
    document.addEventListener("pointerdown", handlePointerDown);
    window.addEventListener("message", scrollMessageListener, false);

    return function cleanup() {
        document.removeEventListener("mousemove", throttledMousemove);
        document.removeEventListener("scroll", throttledScroll);
        document.removeEventListener("click", handleClick);
        document.removeEventListener("pointerdown", handlePointerDown);
        window.removeEventListener("message", scrollMessageListener);
    };
}
