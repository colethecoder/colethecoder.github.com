---
layout: post
title: Generating Charts For Bots
subtitle:   System.Web.UI.DataVisualization.Charting and Bot Framework
date:       2017-10-12 12:00:00
author:     "Tom Cole"
header-img: "img/random-number-colours.png"
creative-commons-image-url: https://www.flickr.com/photos/mattimattila/4199480589
tags: c# bot-framework
---

Building an interesting user experience through bots frequently requires the use of images, differing channels have varying capabilities and you can use the [Channel Inspector](https://docs.botframework.com/en-us/channel-inspector/channels/Skype?f=Carousel&e=example1) web page to get an idea of what these are for your target platform.

One thing all the image presentations (Hero Card, Thumbnail Card, Attachment etc) have in common is that they ask for a URL to the image. In dynamic scenarios, like generating a chart image, a web facing URL to the image is not necessarily easy. You could create a one-off URL on your web app but that might have security implications and brings caching and other potential headaches. Another option is to generate a base64 string for the image and return a data url as you might in a HTML img tag i.e.

{% highlight html %}

    <img src="data:image/gif;base64,R0lGODlhPQBEAPeoAJosM//AwO/AwHVYZ/z595kzA........."/>
{% endhighlight %}

Since a bot built on Bot Framework is just an extended web app a quick way to generate a dynamic chart is to use System.Web.UI.DataVisualization.Charting. This can be found by adding a reference to the System.Web.DataVisualization assembly in your project.

To generate your chart you might use code similar to:

{% highlight c# %}
public string GetLineChart(Dictionary<DateTime, double> points, string title)
{
    // Create a series and add data points to it

    var series = new Series("Chart");
    foreach (var point in points)
    {
        series.Points.AddXY(point.Key, point.Value);
    }
    series.ChartType = SeriesChartType.Line;
    series.MarkerStyle = MarkerStyle.Circle;
    
    // Generate chart

    var chart = new Chart{Height = 800, Width = 800, Titles = { new Title(title)}};
    
    // Setup some styling

    chart.BackColor = Color.FromArgb(211, 223, 240);
    chart.BorderlineDashStyle = ChartDashStyle.Solid;
    chart.BackGradientStyle = GradientStyle.TopBottom;
    chart.BorderlineWidth = 1;
    chart.Palette = ChartColorPalette.BrightPastel;
    chart.BorderlineColor = Color.FromArgb(26, 59, 105);
    chart.RenderType = RenderType.BinaryStreaming;
    chart.BorderSkin.SkinStyle = BorderSkinStyle.Emboss;
    chart.AntiAliasing = AntiAliasingStyles.All;
    chart.TextAntiAliasingQuality = TextAntiAliasingQuality.Normal;
    
    // Add series to chart with area

    chart.Series.Add(series);
    var area = new ChartArea("Area");            
    chart.ChartAreas.Add(area);
    chart.ChartAreas[0].AxisX.LabelStyle.Format = "t";
    
    // Save it to a stream

    var imageStream = new System.IO.MemoryStream();
    chart.SaveImage(imageStream, ChartImageFormat.Png);

    // Convert stream to base64 string

    var base64 = Convert.ToBase64String(imageStream.ToArray());

    // Return base64 string prefixed with the relevant data URL parameters

    return $"data:image/png;base64,{base64}";
}
{% endhighlight %}

To then add this to a card in your dialog code you would do something like:

{% highlight c# %}
public async Task GetChart(IDialogContext context, IAwaitable<IMessageActivity> activity)
{
    // Some mechanism for retrieving data

    var data = GetData();

    // Call the chart method

    var chartDataUrl = GetLineChart(data, "Chart Title"); 
    
    var message = context.MakeMessage();    
    var card = new HeroCard
        {
            Title = "Chart",
            Subtitle = "Demo"
        };
    card.Images = new List<CardImage> {new CardImage(url: chartDataUrl};
    var attachment = new Attachment(contentType: HeroCard.ContentType, content: card);    
    message.Attachments.Add(attachment);

    await context.PostAsync(message);
    context.Wait(this.MessageReceived);
}
{% endhighlight %}

Or to return as an attachment, which may be preferable on some channels from a zoom perspective (an attachment can be opened full size in Teams / Skype whereas a Hero Card might be scaled down and hard to read).

{% highlight c# %}
public async Task GetChart(IDialogContext context, IAwaitable<IMessageActivity> activity)
{
    // Some mechanism for retrieving data

    var data = GetData();

    // Call the chart method

    var chartDataUrl = GetLineChart(data, "Chart Title"); 

    var message = context.MakeMessage();    
    var attachment = new Attachment(contentType: "image/png", contentUrl: url);
    message.Attachments.Add(attachment);

    await context.PostAsync(message);
    context.Wait(this.MessageReceived);
}
{% endhighlight %}