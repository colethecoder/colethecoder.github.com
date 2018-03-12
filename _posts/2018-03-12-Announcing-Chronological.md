---
layout: post
title: Announcing Chronological
subtitle:   Azure Time Series Insights Client for .Net
date:       2018-03-12 12:00:00
author:     "Tom Cole"
header-img: "img/clock1.jpg"
creative-commons-image-url: https://www.flickr.com/photos/nickdun/8245237743
tags: c# time-series-insights
---

At present I spend much of my working day on IoT projects and dealing with time series data has become a vital part of this. Relational or Document based databases aren't really designed to handle lots of telemetry data and trying to do quick queries such as "mean temperature for a particular sensor in the last hour" become painful as data grows. For a while my team experimented with InfluxDB, running in a virtual machine in Azure with some success, but with most of our software moving towards PaaS based services (Azure Functions, Event Grid, Azure SQL etc) maintaining a VM was something we really wanted to avoid. 

Last year Microsoft released Azure Time Series Insights, a platform for storing and then subsequently analysing and visualising time series data. We started using it in preview and were really impressed with its performance on the data we were throwing at it. Time Series Insights has a web UI for navigating and querying data and then showing it in various ways, it also supports exporting that data in various ways. To truly be useful as a data store though the data has to be accessible to external applications, fortunately Microsoft provide a REST API for that.

The REST API is documented at: 

[https://docs.microsoft.com/en-us/rest/api/time-series-insights/time-series-insights-reference-queryapi](https://docs.microsoft.com/en-us/rest/api/time-series-insights/time-series-insights-reference-queryapi)

There are sample apps for connecting to it at:

[https://github.com/Azure-Samples/Azure-Time-Series-Insights](https://github.com/Azure-Samples/Azure-Time-Series-Insights)

When we started to tackle connecting our applications to the API we quickly found that there was quite a bit of code needed to authenticate, navigate environments and metadata, create the queries in the correct JSON syntax, send the request and then parse the result data. With this in mind, last autumn I started building Chronological, an open source .Net Standard library to simplify access to the API.

The code and documentation is here:

[https://github.com/colethecoder/chronological](https://github.com/colethecoder/chronological)

and if you just want to install a package and get on with it you can get it on nuget here:

[https://www.nuget.org/packages/Chronological/](https://www.nuget.org/packages/Chronological/)

Chronological is a deliberately opinionated wrapper around the API to make accessing time series data feel very familiar to .Net developers. Data in Time Series Insights can take the form of many schemas, imagine a bunch of different sensors firing lots of different readings into the same data store, as a result the API returns a very generic data structure to cope with multiple different schemas in one result set. This approach has its benefits but generally when you are querying data from an application you have some idea of the schema you will be returning. In Chronological you setup an entity class, decorate with a few attributes to reflect the schema you are expecting, connect to your environment and then run a query which returns you an IEnumerable of your entity type. A really simple query for events would look like:

{% highlight c# %}
public class TimeSeriesEntity
{
    [ChronologicalEventField("DeviceId")]
    public string Id { get; set; }

    [ChronologicalEventField(BuiltIn.EventTimeStamp)]
    public DateTime Date { get; set; }

    [ChronologicalEventField("EventType")]
    public string Type { get; set; }

    [ChronologicalEventField("Measurement.Value")]
    public double? Value { get; set; }
}

class Program
{
    static async Task Main(string[] args)
    {
        var connection = new Chronological.Connection("YourApplicationClientID",
                        "YourApplicationClientSecret", "YourTenant");

        var environments = await connection.GetEnvironmentsAsync();

        var environment = environments.First();

        var events = await environment.EventQuery<TimeSeriesEntity>(DateTime.UtcNow.AddDays(-1), DateTime.UtcNow, Limit.Take, 200)
                    .Where(x => x.Value > 5)
                    .ExecuteAsync();

        foreach(var e in events)
        {
            Console.WriteLine($"Type: {e.Type}");            
        }

        Console.ReadLine();
    }
}
{% endhighlight %}

This is a very simple query just getting 200 events within a date range with a "Measurement.Value" greater than 5. It would generate a JSON query similar to:

{% highlight javascript %}
{
  "headers": {
    "x-ms-client-application-name": "ChronologicalQuery",
    "Authorization": "Bearer AUTH_TOKEN"
  },
  "content": {
    "searchSpan": {
      "from": "2017-12-12T23:02:39.3671297Z",
      "to": "2018-03-12T23:02:39.3671297Z"
    },
    "predicate": {
      "predicateString": "([Measurement.Value] > 5)"
    },
    "take": 200
  }
}
{% endhighlight %}

Note in particular that the lambda Where clause has been transformed into the correctly structured predicateString. The nested data structure returned by the API is then parsed by Chronological into the entity class.

Chronological v1.0 is currently in alpha, I intend to release a couple of betas as I receive bugs and feedback and then proper release in a few weeks. If you are interested in Time Series Insights please give Chronological a try and give me a shout on Github or Twitter if you have any problems or suggestions.
