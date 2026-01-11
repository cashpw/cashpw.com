+++
title = "Blog"
author = ["Cash Prokop-Weaver"]
date = 2025-11-22T11:22:00-08:00
lastmod = 2026-01-10T22:52:00-08:00
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
        (when (re-search-forward "^\\*+ Footnotes" nil t)
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


### Full-width {#full-width}

Content width is limited, by default, to allow for footnotes to appear floating{{< sidenote >}}Like this!{{< /sidenote >}}. However, sometimes we want a full-width section. Set this with the `fullwidth` CSS class.

{{< figure src="/ox-hugo/2025-01-04_20-00-24_31940527503_8b73d0ecaf_o_d.jpg" caption="<span class=\"figure-number\">Figure 1: </span>_The Long Cloud_ (Frederick Sound) by Mark Galer" class="fullwidth" >}}

_The Long Cloud_ (Frederick Sound) by Mark Galer.

I can set the CSS class in `org-mode`:

```org
#+attr_html: :class fullwidth
#+caption: /The Long Cloud/ (Frederick Sound) by Mark Galer
[[file:2025-01-04_20-00-24_31940527503_8b73d0ecaf_o_d.jpg]]
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
;; (require 'org-defblock)

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


### Backlinks {#backlinks}

The following adds the "Backlinks" heading and populates it with (public) notes which link to the current note.

```emacs-lisp
(defun cashpw/org-roam-get-public-backlinks-for-current-node ()
  "Return unique list of `org-roam-node's which link back to current node."
  (when (org-roam-file-p)
    (let ((-compare-fn
           ;; For -uniq
           (lambda (a b)
             (string=
              (org-roam-node-id (org-roam-backlink-source-node a))
              (org-roam-node-id (org-roam-backlink-source-node b))))))
      (-uniq
       (--filter
        (let ((source-node (org-roam-backlink-source-node it)))
          (and
           ;; Remove flashcards
           (not (assoc "FC_ALGO" (org-roam-node-properties source-node)))
           ;; Remove non-public nodes
           (member "public" (org-roam-node-tags source-node))))
        (org-mem-roamy-mk-backlinks (org-roam-node-at-point)))))))

(defun cashpw/org-roam--export-backlinks (backend)
  "Add backlinks to roam buffer for export; see `org-export-before-processing-hook'."
  (pcase backend
    ('hugo
     (when (org-roam-file-p)
       (let*
           ((backlinks
             (--sort
              ;; Alpha sort, descending
              (string<
               (org-roam-node-title (org-roam-backlink-source-node it))
               (org-roam-node-title (org-roam-backlink-source-node other)))
              (cashpw/org-roam-get-public-backlinks-for-current-node)))
            (backlinks-as-string
             (--reduce-from
              (let* ((source-node (org-roam-backlink-source-node it))
                     (id (org-roam-node-id source-node))
                     (file (org-roam-node-file source-node))
                     (title (org-roam-node-title source-node)))
                (concat acc (s-lex-format "- [[id:${id}][${title}]]\n")))
              "" backlinks)))
         (unless (string-empty-p backlinks-as-string)
           (save-excursion
             (goto-char (point-max))
             (insert (concat "\n* Backlinks\n" backlinks-as-string)))))))
    (_ nil)))

(add-hook!
 'org-export-before-processing-hook 'cashpw/org-roam--export-backlinks)
```


### Citations {#citations}

I have dedicated notes for some citations and prefer to replace the usual bibliography citation with links to those notes.

```emacs-lisp
(defun cashpw/org-roam--replace-citations-with-id-links (backend)
  "Replace [cite:@key] with [[id:ID][Title]] in current buffer if they're public."
  (pcase backend
    ('hugo
     (save-excursion
       (goto-char (point-min))
       ;; Search for the pattern [cite:@foo] and capturing "foo".
       (while (re-search-forward "\\[cite:@\\([^]]+\\)\\]" nil t)
         (when-let ((entry
                     (org-mem-entry-by-roam-ref (concat "@" (match-string 1)))))
           (when (member "public" (org-mem-entry-tags entry))
             (let ((id (org-mem-entry-id entry)))
               (unless (save-match-data (string= (org-roam-id-at-point) id))
                 (replace-match (org-link-make-string
                                 (format "id:%s" id) (org-mem-entry-title entry))
                                'fixedcase 'literal))))))))
    (_ nil)))

(add-hook!
 'org-export-before-processing-hook
 'cashpw/org-roam--replace-citations-with-id-links)
```


## Bibliography {#bibliography}

<style>.csl-entry{text-indent: -1.5em; margin-left: 1.5em;}</style><div class="csl-bib-body">
  <div class="csl-entry"><a id="citeproc_bib_item_1"></a>“Line Length.” 2025. In <i>Wikipedia</i>. <a href="https://en.wikipedia.org/w/index.php?title=Line_length&oldid=1326290342">https://en.wikipedia.org/w/index.php?title=Line_length&#38;oldid=1326290342</a>.</div>
</div>
