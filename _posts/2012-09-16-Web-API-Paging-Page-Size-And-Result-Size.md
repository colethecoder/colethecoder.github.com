---
layout: post
title: Web API - Getting Started - Paging, Page Size and Result Size
tags: web-api c# rest
---
I've built a few RESTful APIs in recent years as an alternative to SOAP web services. Over that time it's got much easier to build them in .Net, firstly MVC v3 added the JsonResult allowing you to just return JSON simply from Controllers and more recently Web API has emerged alongside MVC v4 as a way of building this type of API really simply.

One of the first things I often need to do is get some type of result paging working to support returning only parts of large result sets. The beta versions of Web API has a couple of ways of doing this either using an OData style syntax or handcrafting it through the querystring but in the final RTM version the [Queryable] attribute was dropped and [this OData support omitted](http://aspnetwebstack.codeplex.com/SourceControl/changeset/af11adf6b3c5 "http://aspnetwebstack.codeplex.com/SourceControl/changeset/af11adf6b3c5") so for now we are left with handcrafting

To do this we first need to: 

* Start a new Project in VS2012
* Choose "ASP.Net MVC 4 Web Application" 
* In the MVC4 dialog choose "Web API"

VS will generate a new project for you and immediately give you a ValuesController.

Hit F5 to debug and in the browser navigate to:

> http://[your debug server]/api/values

This will do a GET request which goes through the ValuesController and hits the method:

{% highlight c# %}
public IEnumerable<string> Get()
{
    return new string[] { "value1", "value2" };
}
{% endhighlight %}

Note that if you've used Chrome to do the query you get the result as XML, this is because the default GET header contains the line:

{% highlight http %}
Accept: text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8
{% endhighlight %}

You would get the same result if you simply passed in:

{% highlight http %}
Accept: application/xml
{% endhighlight %}

e.g.

{% highlight xml %}
<ArrayOfstring xmlns:i="http://www.w3.org/2001/XMLSchema-instance" xmlns="http://schemas.microsoft.com/2003/10/Serialization/Arrays">
	<string>value1</string>
	<string>value2</string>
</ArrayOfstring>
{% endhighlight %}

Or you could switch it to JSON with:

{% highlight http %}
Accept: application/json
{% endhighlight %}

which would give you:

{% highlight json %}
["value1","value2"]
{% endhighlight %}

You can try this out with the excellent [Fiddler](http://www.fiddler2.com/fiddler2/ "http://www.fiddler2.com/fiddler2/"). Re-perform the action in the browser with Fiddler running and then drag the request into the Composer where you can manipulate and "Execute" it. This is much easier than trying to do it through the browser over and over and looking in the Inspector -> Raw views you can see exactly what's going on. I'll stick with the JSON requests for now.

So once you start to dip your toes into the world of REST you'll find a lot of arguments over what is and isn't RESTful. I'm going to handle my paging in tthe querystring, I think this looks clean and feels REST-y enough for me, I'm sure other people will have differing opinions. What I want to do is be able to limit the query using a url like:

> http://[your debug server]/api/values?page=1&pageSize=2

To do this I add a couple of optional parameters to the Get method along with default values incase they are not specified. By doing this I stop anyone ever returning the whole result set unless they intentionally do so by overriding the pageSize with a big enough number.

{% highlight c# %}

List<string> values = new List<string>
        {
            "value1", "value2", "value3", "value4", "value5"
        };

public IEnumerable<string> Get(int page = 0, int pageSize = 3)
{                
    return values.Skip(page*pageSize).Take(pageSize);
}
{% endhighlight %}

Debugging now I can see that:

> http://[your debug server]/api/values?page=1&pageSize=4

returns:

{% highlight json %}
["value3","value4"]
{% endhighlight %}

This is great but it does give you a bit of a problem if you want to do something based on the size of the entire result set e.g. have links for all the pages for navigation, since you would not know how many pages worth of data there was. I've seen numerous approaches for this that involve either a second call to another resource for a count or that modify the result set to add the count in. Neither feel particularly clean to me and my preference is to add it into it's own custom HTTP header, so that irrespective of the limitations you have implemented through the querystring the entire count is always available e.g.

{% highlight http %}
X-Result-Count: 5
{% endhighlight %}

would highlight that there are 5 results in total.

To implement this we have to make a few alterations to our previous method to expose the HttpResponseMessage so that we can access the headers.

{% highlight c# %}
public HttpResponseMessage Get(int page = 0, int pageSize = 3)
        {
            var returnValue = values.Skip(page * pageSize).Take(pageSize);
            HttpResponseMessage response = Request.CreateResponse(HttpStatusCode.OK, returnValue);
            response.Headers.Add("X-Result-Count",values.Count.ToString());
            return response;
        }
{% endhighlight %}

Note the return type is now a HttpResponseMessage and we wrap the data up inside it through the Request.CreateResponse. We then simply add the header and return the response.

This does everything we need to simply return paged results and know the overall size the entire response message for:

> http://[your debug server]/api/values?page=1&pageSize=4

looks something like:

{% highlight http %}
HTTP/1.1 200 OK
Cache-Control: no-cache
Pragma: no-cache
Content-Type: application/json; charset=utf-8
Expires: -1
Server: Microsoft-IIS/8.0
X-Result-Count: 5
X-AspNet-Version: 4.0.30319
X-SourceFiles: =?UTF-8?B?RTpcSW5mb3JtXEFQSVRlc3RcQVBJZGVzdFxhcGlcdmFsdWVz?=
X-Powered-By: ASP.NET
Date: Sun, 16 Sep 2012 22:16:18 GMT
Content-Length: 19

["value3","value4"]
{% endhighlight %}

We are still left with one final awkward scenario, what if we want to retreive the result set size without any data, well we could compromise and return a single result but this seems clumsy. Fortunately there is the HTTP verb HEAD for just this sort of thing. We can implement it so that a HEAD request includes the result size parameter. Web API makes this really simply since we can just add the following method:

{% highlight c# %}
public HttpResponseMessage Head()
{
    HttpResponseMessage response = Request.CreateResponse();
    response.Headers.Add("X-Result-Count", values.Count.ToString());
    return response;
}
{% endhighlight %}

now a HEAD request will include the X-Result-Count.