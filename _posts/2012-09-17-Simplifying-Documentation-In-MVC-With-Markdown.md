---
layout: post
title: Simplifying Documentation In MVC With Markdown
tags: markdown mvc twitter-bootstrap writing
---
Recently I've been building an API for work with the new ASP.Net Web API features and needed to document the functionality for 3rd Party users. I defaulted to cranking open Word and started typing, but it felt clunky. As soon as I started to create a table to track version history I started to foresee the confusion often caused in keeping the documentation in sync with the version of the API. Add to that the API is likely to be used on multiple customer sites which may not all be on the same version of the software and there is a recipe for issues in the future.

I decided instead to opt for web based documentation built into the API to ease the potential for syncing issues. I [previously posted](http://colethecoder.com/2012/09/16/Markdown-MVC-Mashup/) about my new-found love of Markdown for simplifying publishing for this blog and whilst there are loads of wiki packages out there I opted for a simple Markdown based solution. Fortunately there's already a Nuget package available to aid with this: [Kiwi.Markdown](http://nuget.org/packages/Kiwi.Markdown).

To include in a Web API project (I've assumed the Razor view engine) you can start by using the Package Manager console:

> PM> Install-Package Kiwi.Markdown

to keep it nicely formatted I also threw in Twitter Bootstrap:

> PM> Install-Package Twitter.Bootstrap

The Kiwi.Markdown package creates a new view for you for formatting the Markdown. 

> Views\Wiki\Doc.cshtml

By default this file will be picking up its layout from:

> Views\Shared\\_Layout.cshtml

To incorporate Bootstrap into your Markdown pages, change  _Layout.cshtml to:

'''html
<!DOCTYPE html>
<html>
	<head>
	    <meta charset="utf-8" />
	    <meta name="viewport" content="width=device-width" />
	    <title>@ViewBag.Title</title>
	    <link href="@Url.Content("~/Content/bootstrap.min.css")" rel="stylesheet" />
	    <style type="text/css">
	      body {
	        padding-top: 60px;
	        padding-bottom: 40px;
	      }
	    </style>
	    <link href="@Url.Content("~/Content/bootstrap.responsive-min.css")" rel="stylesheet" />
	</head>
    <body>
        <div class="navbar navbar-fixed-top">
            <div class="navbar-inner">
                <div class="container">
                    <a class="btn btn-navbar" data-toggle="collapse" data-target=".nav-collapse">
                        <span class="icon-bar"></span>
                        <span class="icon-bar"></span>
                        <span class="icon-bar"></span>
                    </a>
                    <a class="brand" href="#">DOCUMENTATION NAME HERE</a>
                    <div class="nav-collapse">
                        <ul class="nav">
                            <li class="active"><a href="#">Home</a></li>
                        </ul>
                    </div>
                </div>
            </div>
        </div>
        <div class="container">
            @RenderBody()
        </div>
            @Scripts.Render("~/bundles/jquery")
            @RenderSection("scripts", required: false)
    </body>
</html>
'''

and your Doc.cshtml to:

'''html
@using Kiwi.Markdown
@model Document

@{
    ViewBag.Title = @Model.Title;
}

<div class="span12">
    <h1>@Model.Title</h1>

    @Html.Raw(Model.Content)
</div>
'''

Now adding md files to:

> App_Data\MarkdownFiles\

will result in nice neatly formatted good looking documentation.