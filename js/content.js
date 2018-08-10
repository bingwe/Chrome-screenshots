chrome.extension.onMessage.addListener(function(message, sender, resCallback){
    if (message.option == 'getCurrentPageSize') {
        var pageSize = {
            scrollHeight: $(document).height(),
            scrollWidth: $(document).width(),
            clientWidth: document.documentElement.clientWidth,
            clientHeight: document.documentElement.clientHeight
        };
        resCallback(pageSize);
    } else if (message.option == 'scrollPage') {
        // window.scrollBy(message.x, message.y);
        var t = $(window).scrollTop();
        $('body,html').animate({'scrollTop': t + message.y}, 700);
        resCallback();
    }
});