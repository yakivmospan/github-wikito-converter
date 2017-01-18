# Github Wikito Converter

Github Wikito Converter allows you to generate HTML & PDF documentation from your Github wiki or any other markdown-based wiki. It is build on top of [Limedocs Wiki Converter](https://github.com/limedocs/limedocs-wiki-converter) and contains new features and bug fixes, check the [release notes](https://github.com/yakivmospan/github-wikito-converter/releases) to see them.

# Prerequesites

- [Node.js](https://nodejs.org/) or [io.js](https://iojs.org/en/index.html)
- [wkhtmltopdf](http://wkhtmltopdf.org/downloads.html) (only necessary for pdf output format)

# Installation

```bash
npm install -g github-wikito-converter
```

# Usage

## Basic usage

```bash
# Clone your github wiki for example
git clone https://github.com/yakivmospan/github-wikito-converter.wiki.git

# Convert your wiki
gwtc ./github-wikito-converter.wiki
```

## Usage help
```
  Usage: gwtc [options] <wiki-dir>

  Convert a wiki

  Options:

    -h, --help                   output usage information
    -V, --version                output the version number
    -f, --format <format>        Format to convert to. Either html, pdf, or all [default: html]
    -o, --output <output-dir>    Output dir [default: './']
    -t, --title <title>          Wiki title [default: Documentation]
    -d, --disable-inline-assets  Disable inlining of images, css and js in html document
    --toc <toc-file>             Wiki TOC file
    --toc-level <level>          Table of contents deep level [default: 3]
    --highlight-theme <theme>    Highlighter theme [default: github]
    --css <css-file>             Additional CSS file
    -v --verbose                 Verbose mode
```


# Formats

## HTML

### Pages to be included in the documentation

By default, *Github Wikito Converter* will check for the following files to use as a table of contents (TOC):

- `_Toc.md`
- `_Sidebar.md` (which is the default sidebar file on Github wikis)

When finding a TOC, *gwtc* will only generate pages linked from this TOC.

### Inlining

By default, the HTML output format will generate a single-page HTML document of you wiki, with all assets inlined, such
as images, css, and javascript. So all you need to transfer documentation (to a colleague for example) is to send him/her
this unique file.

You can disable this inlining feature by passing `--disable-inline-assets` (or `-d`) such as several files will be
generated for each of images, css and javascript files.

### Table of contents (TOC)

The *TOC* is rendered using a fixed div in the HTML documentation. You can use `--toc-level` to prevent the *TOC* div
to overlap the `body` element.

## PDF

### Rendering

PDF rendering is done using `wkhtmltopdf` which should be available in your `PATH`.
It simply renders (more or less) the HTML version of your doc in PDF.


# Code highlighting

Code highlighting is rendered using highlight.js.
You can customize the theme used by using the `--highlight-theme` option. By default, `github` theme is used.
