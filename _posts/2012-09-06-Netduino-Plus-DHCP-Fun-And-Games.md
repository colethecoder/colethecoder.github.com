---
layout: post
title: Netduino Plus DHCP
subtitle:   "Device networking fun and games"
date:       2012-09-06 12:00:00
author:     "Tom Cole"
header-img: "img/post-bg-07.jpg"
creative-commons-image-url: https://www.flickr.com/photos/momentsnotice/33405102366/
tags: netduino c#
---
Over the last week I've been playing around with a [Netduino Plus](http://www.netduino.com/netduinoplus/specs.htm) for a little project I've been planning for a while. It's a great little device and really easy to get started with.

The first project I tried was to create a little webserver and I found a great "hello world" example here: [http://netduinohacking.blogspot.co.uk/2011/03/netduino-plus-web-server-hello-world.html](http://netduinohacking.blogspot.co.uk/2011/03/netduino-plus-web-server-hello-world.html)

The tutorial is pretty thorough but I ran into an interesting problem when outputting the assigned IP address out to the debug console while the device was attached to my router via ethernet via the code below:
 
{% highlight c# %}
socket = new Socket(AddressFamily.InterNetwork,SocketType.Stream, ProtocolType.Tcp);
socket.Bind(new IPEndPoint(IPAddress.Any, 80));
Debug.Print(Microsoft.SPOT.Net.NetworkInformation.NetworkInterface.GetAllNetworkInterfaces()[0].IPAddress);
socket.Listen(10);
ListenForRequest();
{% endhighlight %}

I found that every time I started debugging it always output the IP: 192.168.5.100. This is not on my router's subnet (192.168.1.xxx).

After a bit of digging I found that 192.168.5.100 is in fact the Netduino's default IP address and that by being output at this point the most likely issue was that the router hadn't assigned an IP to the device. This can indicate a network configuration issue but in my case it was because it was taking a while to assign an IP (through DHCP) to the device.

A quick rough tweak to the code fixed the issue by adding a while loop to wait for the IP to be assigned before starting listening.

{% highlight c# %}
socket = new Socket(AddressFamily.InterNetwork, SocketType.Stream, ProtocolType.Tcp);
socket.Bind(new IPEndPoint(IPAddress.Any, 80));
string address =  Microsoft.SPOT.Net.NetworkInformation.NetworkInterface.GetAllNetworkInterfaces()[0].IPAddress;
while (address == "192.168.5.100")
{
    address =  Microsoft.SPOT.Net.NetworkInformation.NetworkInterface.GetAllNetworkInterfaces()[0].IPAddress;
    Thread.Sleep(2000);
}
Debug.Print(address);
socket.Listen(10);
ListenForRequest();
{% endhighlight %}

Hope this saves other people time if they run into the same issue.