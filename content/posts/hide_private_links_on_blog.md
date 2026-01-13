+++
title = "Hide private links in blog posts"
author = ["Cash Prokop-Weaver"]
date = 2025-11-27T07:08:00-08:00
lastmod = 2025-12-25T07:52:00-08:00
draft = false
slug = "3643c979-736a-408e-9122-0cc8aea2ca85"
+++

I publish a [subset]({{< relref "notes_should_be_private_by_default.md" >}}) of my notes which I manually mark with a `public` file tag. Sometimes published notes have links to private, unpublished, notes and by default these would all be Hugo errors or, if we [bypass](https://gohugo.io/configuration/all/#reflinkserrorlevel) that check, a `404`. I'd like these links to not be links and instead be plain text.

For example: "This is a [private link](http://example.com)" in my notes should be rendered as "This is a private link" on the blog.


## Solution: Wrap `org-hugo-link` {#solution-wrap-org-hugo-link}

My solution was to wrap the `org-hugo-link` function and conditionally return a non-link string.

```emacs-lisp
(defun cashpw/org-hugo-link-except-private-links (oldfun link desc info)
  "Run `org-hugo-link' when the link is public; otherwise return a non-link."
  (if (and (string= (org-element-property :type link) "id")
           (not
            (member
             "public"
             (cashpw/org-get-filetags
              (org-id-find-id-file (org-element-property :path link))))))
      desc
    (funcall oldfun link desc info)))

(advice-add 'org-hugo-link :around 'cashpw/org-hugo-link-except-private-links)
```


## Didn't work: Render the missing links as plain text in Hugo {#didn-t-work-render-the-missing-links-as-plain-text-in-hugo}

First, I tried a combination of allowing Hugo to render missing links and changing the link rendering template. Hugo throws an error for missing links by default, so I added the following to my config:

```yaml
refLinksErrorLevel: "WARNING"
```

Then, I updated `render-links.html` to test `.Destination` and only render an anchor tag when it was non-empty. This didn't work! As far as I could tell, it has something to do with shortcodes:

```html
<ul>
  <li>plain: {{ .Destination }}</li>
  <li>printf: {{ printf "%#v" .Destination }}</li>
  <li>length: {{ .Destination | len }}</li>
  <li>hex: {{ printf "%x" .Destination }}</li>
</ul>
```

Is rendered as:

```html
<ul>
  <li>plain: </li>
  <li>printf: ""</li>
  <li>length: 25</li>
  <li>hex: 484148414855474f53484f5254434f444532733048424842</li>
</ul>
```

We got something! The hex converts to =HAHA HUGOSHORTCODE2s0 HBHB={{< sidenote >}}Without spaces.{{< /sidenote >}}which corresponds to a [shortcode](https://github.com/gohugoio/hugo/blob/0de8f8607bff16308fbb28816c6e2571c7846d2d/hugolib/shortcode.go#L193) which is later [expanded](https://github.com/gohugoio/hugo/blob/0de8f8607bff16308fbb28816c6e2571c7846d2d/hugolib/shortcode.go#L737) into a link.

As far as I can tell, `render-link.html` is at the wrong stage in the rendering pipeline to do what I'm trying to do. The links are only shortcodes at this point and there's no telling whether or not the shortcode is a valid link.

Perhaps there's a way to get around this in Hugo. I opted to move up a layer and strip the links out my markdown files.


## Backlinks {#backlinks}

-   [Personal website]({{< relref "proj--blog.md" >}})
