---
layout: post
title: Netduino Plus DHCP Fun And Games
---
test2

```ruby
require 'redcarpet'
markdown = Redcarpet.new("Hello World!")
puts markdown.to_html
```

'''c#
socket = new Socket(AddressFamily.InterNetwork,SocketType.Stream, ProtocolType.Tcp);
socket.Bind(new IPEndPoint(IPAddress.Any, 80));
Debug.Print(Microsoft.SPOT.Net.NetworkInformation.NetworkInterface.GetAllNetworkInterfaces()[0].IPAddress);
socket.Listen(10);
ListenForRequest();
'''