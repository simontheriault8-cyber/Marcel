const fs = require('fs');
let code = fs.readFileSync('src/app/components/job-search-modal.component.ts', 'utf8');

const targetDetail = `                  }

                  @if (isJobClosed(job.id)) {`;

const newTargetDetail = `                  }

                  <!-- Pastille Officier / MR -->
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

                  @if (isJobClosed(job.id)) {`;

const targetList = `                        }

                        @if (isJobClosed(job.id)) {`;

const newTargetList = `                        }

                        <!-- Pastille Officier / MR -->
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

                        @if (isJobClosed(job.id)) {`;

code = code.replace(targetDetail, newTargetDetail);
code = code.replace(targetList, newTargetList);

fs.writeFileSync('src/app/components/job-search-modal.component.ts', code);
console.log("Patched modal HTML");
