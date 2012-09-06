---
layout: post
title: Netduino Plus DHCP Fun And Games
---


{% highlight c# %}
	//Initialize Socket class
    socket = new Socket(AddressFamily.InterNetwork, SocketType.Stream, ProtocolType.Tcp);
    //Request and bind to an IP from DHCP server
    socket.Bind(new IPEndPoint(IPAddress.Any, 80));
	//Debug print our IP address
    Debug.Print(Microsoft.SPOT.Net.NetworkInformation.NetworkInterface.GetAllNetworkInterfaces()[0].IPAddress);
    //Start listen for web requests
    socket.Listen(10);
    ListenForRequest();
{% endhighlight %}