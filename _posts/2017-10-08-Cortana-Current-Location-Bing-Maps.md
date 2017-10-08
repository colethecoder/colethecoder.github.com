---
layout: post
title: Showing Current Location on a Map in Cortana Skills
subtitle:   "Bot Framework, Cortana and Bing Maps"
date:       2017-10-08 12:00:00
author:     "Tom Cole"
header-img: "img/globe.jpg"
creative-commons-image-url: https://www.flickr.com/photos/lukeprice88/8162093146
tags: c# bot-framework cortana bing-maps
---

One of the interesting things about working with Bot Framework is the channel-specific features that you can make use of. Whilst many channels offer differing format options for displaying responses, Cortana can also expose extra information to Bot Framework about the user. Recently I've been working with these features to provide a better user experience on one of my bots to give the user information about IoT-enabled machines that are nearby.

To utilise the user's location via Cortana you first have to do a little setup through the Bot web interface ([dev.botframework.com](https://dev.botframework.com)). You need to configure the Cortana channel for your bot and "Request user profile data". For the user's current location in my example I configured:

![User SemanticLocation Current](/img/cortana-request-user-profile-data.jpg) 

Once this is done the next time someone invokes the bot via Cortana it will ask them for consent to share their location. If they agree you should then be able to get the location in Bot Framework from the IDialogContext.

{% highlight c# %}
if (context.Activity.ChannelId == ChannelIds.Cortana)
{
    var userInfo = activity.Entities.FirstOrDefault(e => e.Type.Equals("UserInfo"));
    var currentLocation = userInfo.Properties["CurrentLocation"];
}
{% endhighlight %}

The variable currentLocation is of type [Newtonsoft.Json.Linq.JToken](https://www.newtonsoft.com/json/help/html/T_Newtonsoft_Json_Linq_JToken.htm) and the actual JSON looks like:

{% highlight javascript %}
{ 
    "StartTime": "2017-10-04T07:09:59Z", 
    "EndTime": "2017-10-08T16:15:22Z", 
    "Hub": { 
                "Id": "", 
                "Type": "Other", 
                "Name": "", 
                "Latitude": 52.0375053, 
                "Longitude": -0.7645475,
                "Address": "" 
            }, 
    "VenueName": "", 
    "Away": false 
}
{% endhighlight %}

Now I can get the longitude and latitude with code like:

{% highlight c# %}
var hub = currentLocation["Hub"];
var latitude = hub.Value<double>("Latitude");
var longitude = hub.Value<double>("Longitude");
{% endhighlight %}

Next we want a good way of showing this location to the user. At present we are quite limited on what we can show via the Cortana UI from Bot Framework so the best option is to generate an image of a map. Fortunately Bing Maps exposes a REST API purely for this purpose: [Bing Maps REST Service - Imagery](https://msdn.microsoft.com/en-us/library/ff701724.aspx). To use this service you need a Bing Maps API key, you can sign up for one of these directly or, if you use Azure, you can add it to your subscription. The [Bing Maps Portal](https://www.bingmapsportal.com/) has instructions. Once you have the key it is just a case of building up the querystring for your requirements. Below is the full code for a LUIS Intent that, when called from Cortana, displays a Hero Card for the user's current location:

{% highlight c# %}
[LuisIntent("SearchNearbyMachines")]
public async Task SearchNearbyMachines(IDialogContext context, IAwaitable<IMessageActivity> activityAsync, LuisResult result)
{            
    var activity = await activityAsync;
    if (context.Activity.ChannelId == ChannelIds.Cortana)
    {
        var userInfo = activity.Entities.FirstOrDefault(e => e.Type.Equals("UserInfo"));
        var currentLocation = userInfo.Properties["CurrentLocation"];

        if (currentLocation != null)
        {
            var hub = currentLocation["Hub"];
            var latitude = hub.Value<double>("Latitude");
            var longitude = hub.Value<double>("Longitude");

            // Build the querystring for current location pin

            var currentLocationPinQueryString = $"pp={latitude},{longitude};21;Current%20Location";

            var message = context.MakeMessage();

            // Build the URL for Bing Maps

            var imageUrl =
                $"https://dev.virtualearth.net/REST/v1/Imagery/Map/Road/{latitude},{longitude}/0?mapSize=350,350&{currentLocationPinQueryString}&key={_bingMapsKey}";

            var card = new HeroCard
            {
                Title = "Nearby Machines",
                Images = new List<CardImage> { new CardImage{Url = imageUrl } }                        
            };

            var attachment = new Attachment(contentType: HeroCard.ContentType, content: card);
            message.Attachments.Add(attachment);

            await context.PostAsync(message);
        }
    }
    else
    {
        // Do something for none location-aware channels
        
        await context.PostAsync($"I don't know where you are");
    }
}
{% endhighlight %}

In this example I have set the image size to 350x350 which seems to fit nicely in the Cortana canvas for a Hero Card. I have also created a pin for the current location with the name "Current Location" and styling 21. The resulting Card looks like:

![PurpleBot Screen Shot](/img/purplebot-current-location.JPG)

Obviously this only achieves part of my current aim, I will expand on this in future posts.