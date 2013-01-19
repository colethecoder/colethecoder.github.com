---
layout: post
title: Cruise Control .Net Self Updating Config
tags: continuous-integration
---

I'm a massive advocate of continuous integration (CI). I set up a build server for my team a few years ago and it really changed the way we worked for the better. Cruise Control .Net was the first CI software I used and despite flirting with the likes of TeamCity, FAKE and even TFS I always end up returning to Cruise Control because at the moment it does just enough for what I need and is easy to extend with plugins or Powershell when my requirements are a bit more complex.

When you first set up a build server the config is normally pretty basic but as you and your colleagues get used to it you start to realise quite what it can do for you. My current team have our CI server: pulling source code, grabbing Nuget packages, building, testing, minifying, zipping, deploying, running SQL updates, flashing our office traffic lights and updating our HipChat room every time we commit code. As you can imagine the config for this is now fairly big. A few times in the last year I've needed to roll back config changes and struggled so I eventually ended up shoving the config in source control. This is great but pushing the latest version into source control and then copying it onto the server seemed weird so I started to investigate whether Cruise Control could update itself.

Fortunately on Thoughtwork's CCNet pages there is an [article](http://confluence.public.thoughtworks.org/display/CCNET/Configure+CruiseControl.Net+to+Automatically+Update+its+Config+File) on just that. I quickly modified our config and ran it to try it. It works great but unfortunately if you push bad config to your source control it will trash your CCNet setup and worse, if CCNet is running you might not even find out about this till next time it restarts.

I wanted a more robust mechanism for updating the config, one that validated my config instead of blindly overwriting the master one. Fortunately CCNet ships with [CCValidator.exe](http://build.sharpdevelop.net/ccnet/doc/CCNET/CCValidator.html) which is built for just this purpose.

I found that by using an [exec task](http://build.sharpdevelop.net/ccnet/doc/CCNET/Executable%20Task.html) with a specific successExitCodes section I could create a build that failed if the config was invalid. The important task is:

{% highlight xml %}
<exec>
	<executable>$(CCNetValidatorPath)</executable>
	<description>Validate Config File</description>
	<baseDirectory>C:\</baseDirectory>
	<buildArgs>c:\CI\CruiseControl\ccnet.config --nogui --logfile=c:\CI\Logs\ConfigValidation.log</buildArgs>
	<buildTimeoutSeconds>30</buildTimeoutSeconds>
	<successExitCodes>0</successExitCodes>
</exec>
{% endhighlight %}

Note that I specify a log file. This is useful for tracking what the problem in the config actually is. You can merge it into your build output using the File publisher:

{% highlight xml %}
<publishers>
	<merge>
		<files>
		  <file>c:\CI\Logs\ConfigValidation.log</file>
		</files>
	</merge>
	<xmllogger/>
</publishers>
{% endhighlight %}

Now I know my config is under source control and I don't even have to log onto our build server to update it.

Full config file can be downloaded from: [https://bitbucket.org/colethecoder/cruise-control-auto-update-demo](https://bitbucket.org/colethecoder/cruise-control-auto-update-demo)
