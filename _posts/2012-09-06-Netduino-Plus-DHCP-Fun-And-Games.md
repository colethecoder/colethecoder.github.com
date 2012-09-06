---
layout: post
title: Netduino Plus DHCP Fun And Games
---
test1

{% highlight csharp %}
socket = new Socket(AddressFamily.InterNetwork,SocketType.Stream, ProtocolType.Tcp);
socket.Bind(new IPEndPoint(IPAddress.Any, 80));
Debug.Print(Microsoft.SPOT.Net.NetworkInformation.NetworkInterface.GetAllNetworkInterfaces()[0].IPAddress);
socket.Listen(10);
ListenForRequest();
{% endhighlight %}