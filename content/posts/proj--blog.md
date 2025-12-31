+++
title = "Blog"
author = ["Cash Prokop-Weaver"]
date = 2025-11-22T11:22:00-08:00
lastmod = 2025-12-30T21:32:00-08:00
tags = ["project"]
categories = ["project"]
draft = false
slug = "21336625-aab6-421f-98c8-988538fc0846"
+++

I thought I'd write a little bit about this blog for anyone curious as well as for my future{{< sidenote >}}So I can remember what I've done, and why.{{< /sidenote >}}and present{{< sidenote >}}Write to think{{< /sidenote >}}selves.

The purpose of this blog --- of me publishing any of these notes, which would otherwise still be written, but for my eyes only --- is primarily from my benefit: knowing (hoping) that others will read what I've written encourages me to write better and to think critically. It's good, to some [extent]({{< relref "hide_private_links_on_blog.md" >}}), to build something in public. I hope these notes can be of some use to the reader.

This is at least the second time I've started a blog. I've been writing notes for a few years now, with myself as the [sole audience]({{< relref "matuschak_andy_write_notes_for_yourself_by_default_disregarding_audience.md" >}}). I'd previously set up `notes.cashpw.com` to publish the entire set in the style of [Andy Matuschak]({{< relref "andy_matuschak.md" >}}) but abandoned it because I found I was censoring myself while writing notes. Now, however, each note is [private by default]({{< relref "notes_should_be_private_by_default.md" >}}) and this gives me cover to work out nuanced, budding, or incomplete thoughts.

I've opted to publish under my own control because I like tinkering and want to maintain a specific aesthetic; minimal and focused on the text.


## Theme {#theme}

I've chosen to use a theme based on [tufte-css](https://github.com/edwardtufte/tufte-css) and loikein's{{< sidenote >}}And [slashformotion](https://github.com/slashformotion/hugo-tufte) and [shawnohare](https://github.com/shawnohare/hugo-tufte) before them.{{< /sidenote >}}[Hugo theme implementation](https://github.com/loikein/hugo-tufte). I discovered through tufte-style websites{{< sidenote >}}[lawler.io](http://lawler.io), [gwern.net](https://gwern.net){{< /sidenote >}}, [discussions on hacker news](https://hn.algolia.com/?dateRange=all&page=0&prefix=true&query=tufte-css&sort=byPopularity&type=story). Lines are ~75 characters wide{{< sidenote >}}"[...] line lengths fall between 45 and 75 characters per line (cpl), though the ideal is 66 cpl (including letters and spaces)." (<a href="#citeproc_bib_item_1">“Line Length” 2025</a>){{< /sidenote >}}and there's copious white space.


## Features {#features}


### Sidenotes {#sidenotes}

I enjoy the `sidenote` feature{{< sidenote >}}Further discussion on [scottstuff.net](https://scottstuff.net/posts/2024/12/17/more-notes-on-notes/) and [gwern.net](https://gwern.net/sidenote#sn1){{< /sidenote >}}of this theme for non-essential tidbits and extras. I publish each blog post from an `org-mode` note using `ox-hugo`. Neither of these support `sidenote` by default. However, `org-mode` does support [footnotes](https://orgmode.org/manual/Creating-Footnotes.html), so I{{< sidenote >}}Gemini 3.0 flash and edited by me{{< /sidenote >}}wrote the following to convert footnotes to `sidenote` shortcodes.

```emacs-lisp
(defun cashpw/org-rewrite-footnotes-to-shortcodes ()
  "Rewrite standard Org footnotes to Hugo 'sidenote' shortcodes.

  1. Extracts content from the '* Footnotes' section.
  2. Replaces inline references (e.g. [fn:1]) with {{</* sidenote */>}}...{{</* /sidenote */>}}.
  3. Deletes the '* Footnotes' heading and its subtree."
  (interactive)
  (save-excursion
    (let* ((ast (org-element-parse-buffer))
           (definitions (make-hash-table :test 'equal))
           (references nil))
      (org-element-map
          ast 'footnote-definition
        (lambda (fn-def)
          (let* ((label (org-element-property :label fn-def))
                 (beg (org-element-property :contents-begin fn-def))
                 (end (org-element-property :contents-end fn-def))
                 ;; Get text and strip surrounding whitespace
                 (content
                  (when (and beg end)
                    (string-trim (buffer-substring-no-properties beg end)))))
            (when (and label content)
              (puthash label content definitions)))))
      (org-element-map
          ast 'footnote-reference (lambda (fn-ref) (push fn-ref references)))
      (setq references
            (sort references
                  (lambda (a b)
                    (> (org-element-property :begin a)
                       (org-element-property :begin b)))))
      (dolist (ref references)
        (let* ((label (org-element-property :label ref))
               (content (gethash label definitions))
               (beg (org-element-property :begin ref))
               (end (org-element-property :end ref)))
          (when content
            (goto-char beg)
            (delete-region beg end)
            (insert
             (format "@@hugo:{{</* sidenote */>}}@@%s@@hugo:{{</* /sidenote */>}}@@"
                     content)))))
      (goto-char (point-min))
      (let ((case-fold-search t)) ;; Case insensitive
        (when (re-search-forward "^\\* Footnotes" nil t)
          (org-back-to-heading)
          (org-cut-subtree))))))
```


### Blockquotes {#blockquotes}

The theme supports `blockquote` tags:

> You think that because you understand "one" that you must therefore understand "two" because one and one make two. But you forget that you must also understand "and."
>
> Jalāl al-Dīn Muḥammad Rūmī

I can define them in `org-mode` as:

```org
#+begin_quote
You think that because you understand "one" that you must therefore understand "two" because one and one make two. But you forget that you must also understand "and."

Jalāl al-Dīn Muḥammad Rūmī
#+end_quote
```


### Epigraphs {#epigraphs}

Epigraphs are fancy blockquotes:

{{< epigraph author="Princess Irulan" cite="Dune" detail="p.1" >}}A beginning is the time for taking the most delicate care that the balances are correct.{{</ epigraph >}}

I created a custom block to specify epigraphs in `org-mode`:

```org
#+begin_epigraph :author "Princess Irulan" :cite Dune :detail p.1
A beginning is the time for taking the most delicate care that the balances are correct.
#+end_epigraph
```

```emacs-lisp
;; https://github.com/cashpw/org-defblock
(require 'org-defblock)

(org-defblock
 epigraph (author nil cite nil detail nil)
 (let* ((params
         (cl-loop
          for (key . val) in
          `(("author" . ,author)
            ("cite" . ,cite)
            ("detail" . ,detail))
          when val collect (format "%s=\"%s\"" key val)))
        (attrs
         (if params
             (concat " " (mapconcat #'identity params " "))
           ""))
        (split-content
         (--filter
          (not
           (or (s-starts-with-p "#+begin_export" it)
               (s-starts-with-p "#+end_export" it)))
          (s-split "\n" contents))))
   (cashpw/log "author: %s, cite: %s, detail: %s" author cite detail)
   (pcase backend
     (`hugo
      (format "{{</* epigraph%s */>}}%s{{</*/ epigraph */>}}"
              attrs
              (s-trim (s-join "\n" split-content))))
     (`md (s-join "\n" (--map (format "> %s" it) split-content)))
     (`markdown (s-join "\n" (--map (format "> %s" it) split-content)))
     (_ (s-join "\n" split-content)))))
```


## Bibliography {#bibliography}

<style>.csl-entry{text-indent: -1.5em; margin-left: 1.5em;}</style><div class="csl-bib-body">
  <div class="csl-entry"><a id="citeproc_bib_item_1"></a>“Line Length.” 2025. In <i>Wikipedia</i>. <a href="https://en.wikipedia.org/w/index.php?title=Line_length&oldid=1326290342">https://en.wikipedia.org/w/index.php?title=Line_length&#38;oldid=1326290342</a>.</div>
</div>
