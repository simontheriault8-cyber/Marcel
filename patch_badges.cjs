const fs = require('fs');
let code = fs.readFileSync('src/app/components/job-search-modal.component.ts', 'utf8');

// Detail view removal
const detailRemoveRegex = /[ \t]*<!-- Pastille Officier \/ MR -->\n[ \t]*@if \(isOfficerJob\(job\.id\)\) \{\n[ \t]*<span\n[ \t]*class="bg-purple-50 text-purple-700 px-3 py-1 rounded-full text-xs font-bold border border-purple-200 flex items-center gap-1 shadow-sm"\n[ \t]*title="Officier"\n[ \t]*>\n[ \t]*Officier \(Off\)\n[ \t]*<\/span>\n[ \t]*\} @else \{\n[ \t]*<span\n[ \t]*class="bg-orange-50 text-orange-700 px-3 py-1 rounded-full text-xs font-bold border border-orange-200 flex items-center gap-1 shadow-sm"\n[ \t]*title="Militaire du rang"\n[ \t]*>\n[ \t]*Militaire du rang \(MR\)\n[ \t]*<\/span>\n[ \t]*\}\n/g;

// List view removal
const listRemoveRegex = /[ \t]*<!-- Pastille Officier \/ MR -->\n[ \t]*@if \(isOfficerJob\(job\.id\)\) \{\n[ \t]*<span\n[ \t]*class="bg-purple-50 text-purple-700 px-1\.5 py-0\.5 rounded border border-purple-200 font-sans text-\[10px\] font-bold uppercase tracking-wider"\n[ \t]*title="Officier"\n[ \t]*>Off<\/span\n[ \t]*>\n[ \t]*\} @else \{\n[ \t]*<span\n[ \t]*class="bg-orange-50 text-orange-700 px-1\.5 py-0\.5 rounded border border-orange-200 font-sans text-\[10px\] font-bold uppercase tracking-wider"\n[ \t]*title="Militaire du rang"\n[ \t]*>MR<\/span\n[ \t]*>\n[ \t]*\}\n/g;

// Insert snippets
const detailSnippet = `                  <!-- Pastille Officier / MR -->
                  @if (isOfficerJob(job.id)) {
                    <span
                      class="bg-purple-50 text-purple-700 px-3 py-1 rounded-full text-xs font-bold border border-purple-200 flex items-center gap-1 shadow-sm"
                      title="Officier"
                    >
                      Officier (Off)
                    </span>
                  } @else {
                    <span
                      class="bg-orange-50 text-orange-700 px-3 py-1 rounded-full text-xs font-bold border border-orange-200 flex items-center gap-1 shadow-sm"
                      title="Militaire du rang"
                    >
                      Militaire du rang (MR)
                    </span>
                  }

`;

const listSnippet = `                        <!-- Pastille Officier / MR -->
                        @if (isOfficerJob(job.id)) {
                          <span
                            class="bg-purple-50 text-purple-700 px-1.5 py-0.5 rounded border border-purple-200 font-sans text-[10px] font-bold uppercase tracking-wider"
                            title="Officier"
                            >Off</span
                          >
                        } @else {
                          <span
                            class="bg-orange-50 text-orange-700 px-1.5 py-0.5 rounded border border-orange-200 font-sans text-[10px] font-bold uppercase tracking-wider"
                            title="Militaire du rang"
                            >MR</span
                          >
                        }

`;

// First remove them
code = code.replace(detailRemoveRegex, '');
code = code.replace(listRemoveRegex, '');

// Then insert before <!-- Pastilles CC et RP -->
code = code.replace(/([ \t]*)<!-- Pastilles CC et RP -->/g, (match, spaces, offset, string) => {
    // Determine which context we're in based on indentation (18 spaces for detail, 24 for list)
    if (spaces.length === 18) {
        return detailSnippet + match;
    } else {
        return listSnippet + match;
    }
});

fs.writeFileSync('src/app/components/job-search-modal.component.ts', code);
console.log("Moved badges");
