---
layout: post
title: Quick Integration Tests Using JSON
tags: tdd c# json
---

A few times recently I've picked up legacy code, with no unit tests and long complex methods and had to tweak it. In an ideal world you'd deconstruct the logic and break it down into a series of small testable steps but when time is short that's not always an option. To avoid any "seat of the pants" hacking and the associated manual testing I sometimes find it useful to write some quick high-level tests that assess all the logic together, save me some time manually testing and provide a little bit of a safety net for future adventurers.

Checking an expected output given a specific input is easy for simple types or small data structures but it quickly turns into lots of tests or stacks of asserts if you have a large object as the result.

A simple method I have used recently to quickly compare two C# objects to ensure their properties match is to serialize the objects and compare the serialized strings to each other. Using [Json.Net](https://www.nuget.org/packages/newtonsoft.json/) and [NUnit](https://www.nuget.org/packages/NUnit/) you can rapidly put together a dirty test that gives you some assurance that what you are doing is working as you expect e.g.

{% highlight c# %}
public void AssertAreEqualByJson(object expected, object actual)
{
    var expectedJson = JsonConvert.SerializeObject(expected);
    var actualJson = JsonConvert.SerializeObject(actual);
    Assert.AreEqual(expectedJson, actualJson);
}
{% endhighlight %}

I'm not advocating this as a replacement for proper testing and if the test fails it can be a bit awkward to work out what the problem is (especially on large objects) but as an alternative to no tests at all it has saved me plenty of time.

