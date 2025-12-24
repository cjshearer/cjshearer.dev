+++
title = "Building Feedback Loops with entr"
date = "2025-12-24"
+++

Having started my career in web development, I've always appreciated the fast feedback loops built into frontend tooling. Hot-reloading makes iteration seamless, but outside web development, such tooling is rare. Here, I show how I use [entr](https://github.com/eradman/entr) to fill those gaps.

<!--more-->

## A Simple Example

I needed to package a Python script to fix the exported DXF files used for [my custom keyboard](https://github.com/cjshearer/cweep)'s case. However, unfamiliarity with Python packaging in Nix led me to repeatedly context switch between writing code and running:

```sh
nix run .#dxf-fix input.dxf output.dxf
```

Using entr, I was able to automate this, watching all git-tracked source files for changes and re-running the command automatically:

```sh
git ls-files | entr -c nix run .#dxf-fix input.dxf output.dxf
```

Note: The `-c` flag clears the screen before running the command, which helps keep the output readable.

## A More Complex Example

Having packaged that Python script, I wanted to automate the end-to-end generation of the keyboard case: extract geometry from the [`kicad`](https://www.kicad.org) PCB, run it through [`openscad`](https://www.openscad.org/), then post-process the resulting DXF files with the Python script.

I needed two processes: one to extract changed geometry from the PCB file, and another to build the final case from the extracted files and the OpenSCAD source. The data flow looks like this:

<div style="max-width: 248px; margin: auto;">

```goat
 .-------------.
|cweep.kicad_pcb|
 '------+------'
        |
        * extract pcb outlines
        |
        v
   .---------.   .--------.
  |cweep-*.dxf| |cweep.scad|
   '----.----'   '----.---'
        |             |
        +.-----------'
        |
        * build case plates
        |
        v
      .---------------.
     |cweep_plate_*.dxf|      
      '---------------'
```

</div>

My initial attempt was to have one entr process spawn the other:

```sh 
find cweep.kicad_pcb |
  entr -s '
    <extract pcb outlines>
    find case/cweep-*.dxf cweep.scad |
      entr <build case plates>
'
```

But this didn't work as expected: the inner entr process never exited, so the outer entr process couldn't rerun extraction when the PCB file changed.

To solve this, I needed two concurrent entr processes:

```sh
find cweep.kicad_pcb |
  entr -s '<extract pcb outlines>'
&
find case/cweep-*.dxf cweep.scad |
  entr -s '<build case plates>'
```

However, this introduced new problems: the second process would not wait for the first process to complete, as the first process writes multiple files, triggering the second as soon as the first file was written. Also, stopping this script required pressing `Ctrl+C` twice, once for each entr process.

For the concurrency problem, I used [flock](https://man7.org/linux/man-pages/man2/flock.2.html) to create a lock file that ensured only one process would run at a time. For the usability problem, I set up a `trap` to handle `SIGINT` signals and exit cleanly:

```sh
trap "exit 1" SIGINT
find cweep.kicad_pcb |
  entr -s '
    flock case/.case_gen.lock -c "
      <extract pcb outlines>
    "
  ' &
find case/cweep-*.dxf cweep.scad |
  entr -ps '
    flock case/.case_gen.lock -c "
      <run case plate builds>
    "
  '
trap - SIGINT
```

Note: The `-p` flag for the second entr process prevents it from running the command immediately on startup. In practice, the first process will probably always acquire the lock first, but this avoids relying on timing. 

With this setup, I was able to optimize my feedback loop for generating the keyboard case, allowing me to focus on the case design without context switching. If you're working outside web development and want faster feedback loops, give entr a try!