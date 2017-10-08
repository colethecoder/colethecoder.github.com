---
layout: post
title: Cortana Timeouts Using Bot Framework
subtitle:   "Microsoft.Bot.Schema.BotTimeoutException / SendActivityToUserAsync failed"
date:       2017-10-06 12:00:00
author:     "Tom Cole"
header-img: "img/bot-clock.jpg"
creative-commons-image-url: https://www.flickr.com/photos/tamaleaver/2170840601
tags: c# bot-framework cortana
---

Whilst working with Bot Framework recently I found myself in a situation whereupon my bot worked perfectly across channels including Skype, Teams and Bot Emulator but within Cortana I'd get a strange error.

![Cortana has run into a problem. Please try again later.](/img/cortana-timeout-error.jpg)

The error occured after a few interactions and following showing some search results which displayed correctly, any subsequent request resulted in the error. After wiring up Application Insights to my bot I finally generated some more interesting errors.

![Exception type: Microsoft.Bot.Schema.BotTimeoutExceptionFailed method: Microsoft.Bot.ChannelConnector.BotAPI. Call to SendActivityToUserAsync failed](/img/application-insights-bot-error.jpg)

This gave me a bit of a clue about where the problem was, somewhere in the conversation Bot Framework is failing to send information to the Cortana backend. This lead me to revisit my code and look at each message being sent. What followed was some rather clumsy trial and error tweaks to isolate the problem message. Finally I discovered that the problem was sending two messages to Cortana in quick succession.

{% highlight c# %}
[LuisIntent("SearchMachines")]
public async Task Search(IDialogContext context, LuisResult result)
{
    var searchingMessage = context.MakeMessage();
    searchingMessage.Speak = "Searching";
    searchingMessage.Text = "Searching";
    await context.PostAsync(searchingMessage);

    var searchResults = searchRepository.Search(result);
    var resultMessage = BuildResultMessage(result);
    await context.PostAsync(resultMessage);
}
{% endhighlight %}

By commenting out the rather pointless "Searching" message we now avoid any errors and Cortana behaves. Another alternative is to only drop the "Searching" message for the Cortana channel i.e.

{% highlight c# %}
[LuisIntent("SearchMachines")]
public async Task Search(IDialogContext context, LuisResult result)
{
    if (context.Activity.ChannelId != ChannelIds.Cortana)
    {
        var searchingMessage = context.MakeMessage();
        searchingMessage.Speak = "Searching";
        searchingMessage.Text = "Searching";
        await context.PostAsync(searchingMessage);
    }

    var searchResults = searchRepository.Search(result);
    var resultMessage = BuildResultMessage(result);
    await context.PostAsync(resultMessage);
}
{% endhighlight %}