import {
  Component,
  ElementRef,
  ViewChild,
  signal,
  inject,
  Output,
  EventEmitter,
} from "@angular/core";
import { CommonModule } from "@angular/common";
import { DomSanitizer, SafeHtml } from "@angular/platform-browser";
import { JobDatabaseService } from "../../services/job-database.service";
import { JobEntry } from "../../services/jobs-data";
import { ReorientationComponent } from "./reorientation.component";

type ModalTab = "catalogue" | "reorientation";

@Component({
  selector: "app-job-search-modal",
  standalone: true,
  imports: [CommonModule, ReorientationComponent],
  template: `
    <div
      #modalContainer
      class="fixed bg-white rounded-lg shadow-2xl border border-slate-300 flex flex-col overflow-hidden transition-all duration-75"
      [class.inset-0]="isFullScreen()"
      [class.z-50]="true"
      [style.left.px]="isFullScreen() ? 0 : position().x"
      [style.top.px]="isFullScreen() ? 0 : position().y"
      [style.width]="isFullScreen() ? '100%' : size().width + 'px'"
      [style.height]="isFullScreen() ? '100%' : size().height + 'px'"
      role="dialog"
      aria-modal="true"
      aria-label="Recherche de métiers"
    >
      <!-- Header (Draggable) -->
      <div
        class="bg-slate-800 text-white p-3 flex justify-between items-center cursor-move select-none shrink-0"
        (mousedown)="startDrag($event)"
      >
        <div class="font-bold flex items-center gap-4">
          <div class="flex items-center gap-2">
            @if (selectedJob() && activeTab() === "catalogue") {
              <button
                (click)="clearSelection()"
                class="hover:bg-slate-700 p-1 rounded-full transition-colors mr-1"
                (mousedown)="$event.stopPropagation()"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  class="h-5 w-5"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    stroke-linecap="round"
                    stroke-linejoin="round"
                    stroke-width="2"
                    d="M15 19l-7-7 7-7"
                  />
                </svg>
              </button>
              <span class="truncate max-w-[300px]">{{
                selectedJob()?.title
              }}</span>
            } @else {
              <svg
                xmlns="http://www.w3.org/2000/svg"
                class="h-5 w-5"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  stroke-width="2"
                  d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                />
              </svg>
              <span class="hidden sm:inline">Portail Carrière</span>
            }
          </div>

          <!-- Tabs -->
          <div
            class="hidden sm:flex bg-slate-900 rounded-lg p-1 gap-1"
            (mousedown)="$event.stopPropagation()"
          >
            <button
              (click)="activeTab.set('reorientation')"
              class="px-3 py-1 rounded-md text-sm font-medium transition-colors"
              [class.bg-slate-700]="activeTab() === 'reorientation'"
              [class.text-white]="activeTab() === 'reorientation'"
              [class.text-slate-400]="activeTab() !== 'reorientation'"
              [class.hover:text-white]="activeTab() !== 'reorientation'"
            >
              Réorientation
            </button>
            <button
              (click)="activeTab.set('catalogue')"
              class="px-3 py-1 rounded-md text-sm font-medium transition-colors"
              [class.bg-slate-700]="activeTab() === 'catalogue'"
              [class.text-white]="activeTab() === 'catalogue'"
              [class.text-slate-400]="activeTab() !== 'catalogue'"
              [class.hover:text-white]="activeTab() !== 'catalogue'"
            >
              Catalogue
            </button>
          </div>
        </div>

        <div
          class="flex items-center gap-2"
          (mousedown)="$event.stopPropagation()"
        >
          <!-- Full Screen Toggle -->
          <button
            (click)="toggleFullScreen()"
            class="p-1 hover:bg-slate-700 rounded transition-colors"
            aria-label="Basculer en plein écran"
          >
            <svg
              *ngIf="!isFullScreen()"
              xmlns="http://www.w3.org/2000/svg"
              class="h-5 w-5"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                stroke-linecap="round"
                stroke-linejoin="round"
                stroke-width="2"
                d="M4 8V4m0 0h4M4 4l5 5m11-1V4m0 0h-4m4 0l-5 5M4 16v4m0 0h4m-4 0l5-5m11 5l-5-5m5 5v-4m0 4h-4"
              />
            </svg>
            <svg
              *ngIf="isFullScreen()"
              xmlns="http://www.w3.org/2000/svg"
              class="h-5 w-5"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                stroke-linecap="round"
                stroke-linejoin="round"
                stroke-width="2"
                d="M9 9V4m0 5H4m5 0l-5-5M15 15v5m0-5h5m-5 0l5 5M15 9V4m0 5h5m-5 0l5-5M9 15v5m0-5H4m5 0l-5 5"
              />
            </svg>
          </button>
          <!-- Close -->
          <button
            (click)="close()"
            class="p-1 hover:bg-red-600 rounded transition-colors"
            aria-label="Fermer"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              class="h-5 w-5"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                stroke-linecap="round"
                stroke-linejoin="round"
                stroke-width="2"
                d="M6 18L18 6M6 6l12 12"
              />
            </svg>
          </button>
        </div>
      </div>

      <!-- Mobile Tabs (visible only on small screens) -->
      <div class="sm:hidden bg-slate-800 p-2 flex gap-2 shrink-0">
        <button
          (click)="activeTab.set('reorientation')"
          class="flex-1 px-3 py-2 rounded-md text-sm font-medium transition-colors"
          [class.bg-slate-700]="activeTab() === 'reorientation'"
          [class.text-white]="activeTab() === 'reorientation'"
          [class.text-slate-400]="activeTab() !== 'reorientation'"
        >
          Réorientation
        </button>
        <button
          (click)="activeTab.set('catalogue')"
          class="flex-1 px-3 py-2 rounded-md text-sm font-medium transition-colors"
          [class.bg-slate-700]="activeTab() === 'catalogue'"
          [class.text-white]="activeTab() === 'catalogue'"
          [class.text-slate-400]="activeTab() !== 'catalogue'"
        >
          Catalogue
        </button>
      </div>

      <!-- Content -->
      <div
        class="flex-1 flex flex-col overflow-hidden relative bg-white min-h-0"
      >
        <!-- TAB 1: CATALOGUE -->
        <div
          [class.hidden]="activeTab() !== 'catalogue'"
          class="flex-1 overflow-hidden relative flex flex-col w-full h-full"
        >
          @if (selectedJob(); as job) {
            <!-- DETAIL VIEW -->
            <div class="flex-1 overflow-y-auto p-6 min-h-0">
              <div class="mb-6 border-b border-slate-200 pb-4">
                <h2 class="text-2xl font-bold text-slate-800 mb-2">
                  {{ job.title }}
                </h2>
                <div class="flex flex-wrap gap-2">
                  <span
                    class="bg-indigo-100 text-indigo-800 px-3 py-1 rounded-full text-sm font-semibold border border-indigo-200"
                    >ID: {{ job.id }}</span
                  >
                  <span
                    class="bg-slate-100 text-slate-700 px-3 py-1 rounded-full text-sm font-semibold border border-slate-200"
                    >{{ job.abbreviation }}</span
                  >

                  <!-- Pastilles CC et RP -->
                  @if (isJobRp(job.id)) {
                    <span
                      class="bg-blue-50 text-blue-700 px-3 py-1 rounded-full text-xs font-bold border border-blue-200 flex items-center gap-1 shadow-sm"
                    >
                      <svg
                        class="w-3.5 h-3.5"
                        xmlns="http://www.w3.org/2000/svg"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        stroke-width="2.5"
                        stroke-linecap="round"
                        stroke-linejoin="round"
                      >
                        <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path>
                        <polyline points="22 4 12 14.01 9 11.01"></polyline>
                      </svg>
                      Citoyen canadien (CC)
                    </span>
                    <span
                      class="bg-emerald-50 text-emerald-700 px-3 py-1 rounded-full text-xs font-bold border border-emerald-200 flex items-center gap-1 shadow-sm"
                    >
                      <svg
                        class="w-3.5 h-3.5"
                        xmlns="http://www.w3.org/2000/svg"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        stroke-width="2.5"
                        stroke-linecap="round"
                        stroke-linejoin="round"
                      >
                        <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path>
                        <polyline points="22 4 12 14.01 9 11.01"></polyline>
                      </svg>
                      Résident permanent (RP)
                    </span>
                  } @else {
                    <span
                      class="bg-blue-50 text-blue-700 px-3 py-1 rounded-full text-xs font-bold border border-blue-200 flex items-center gap-1 shadow-sm"
                      title="Admissible aux citoyens canadiens uniquement"
                    >
                      <svg
                        class="w-3.5 h-3.5"
                        xmlns="http://www.w3.org/2000/svg"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        stroke-width="2.5"
                        stroke-linecap="round"
                        stroke-linejoin="round"
                      >
                        <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path>
                        <polyline points="22 4 12 14.01 9 11.01"></polyline>
                      </svg>
                      Citoyen canadien uniquement (CC)
                    </span>
                  }

                  @if (isJobClosed(job.id)) {
                    <span
                      class="bg-red-100 text-red-800 px-3 py-1 rounded-full text-sm font-semibold border border-red-200 flex items-center gap-1"
                    >
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        class="h-4 w-4"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                      >
                        <path
                          stroke-linecap="round"
                          stroke-linejoin="round"
                          stroke-width="2"
                          d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"
                        />
                      </svg>
                      Fermé (SIP)
                    </span>
                  }
                  @if (job.contracts) {
                    @for (contract of job.contracts; track contract.program) {
                      <span
                        class="bg-emerald-100 text-emerald-800 px-3 py-1 rounded-full text-sm font-semibold border border-emerald-200"
                        title="{{ contract.program }}"
                      >
                        Contrat initial: {{ contract.duration }}
                        @if (contract.program !== "Enrôlement direct") {
                          ({{ contract.program }})
                        }
                      </span>
                    }
                  }
                </div>
              </div>

              <div class="prose prose-slate max-w-none">
                @if (job.details) {
                  <!-- STRUCTURED TABLE VIEW -->
                  @for (detail of job.details; track $index) {
                    <div class="mb-8">
                      <h3
                        class="text-lg font-bold text-slate-900 underline mb-4"
                      >
                        {{ detail.force }}
                      </h3>

                      <div
                        class="overflow-x-auto border border-slate-300 rounded-lg shadow-sm"
                      >
                        <table class="w-full text-sm text-left border-collapse">
                          <thead
                            class="bg-slate-200 text-slate-800 uppercase font-bold"
                          >
                            <tr>
                              <th class="p-3 border border-slate-300 w-1/4">
                                CANDIDATS
                              </th>
                              <th class="p-3 border border-slate-300 w-1/2">
                                SCOLARITÉ
                              </th>
                              <th class="p-3 border border-slate-300 w-1/4">
                                EXPÉRIENCE
                              </th>
                            </tr>
                          </thead>
                          <tbody>
                            @for (
                              group of detail.candidateGroups;
                              track $index
                            ) {
                              @for (
                                req of group.requirements;
                                track $index;
                                let first = $first
                              ) {
                                <tr class="bg-white hover:bg-slate-50">
                                  @if (first) {
                                    <td
                                      [attr.rowspan]="group.requirements.length"
                                      class="p-3 border border-slate-300 font-semibold align-top bg-slate-50"
                                    >
                                      <ul
                                        class="list-disc list-outside ml-4 space-y-1"
                                      >
                                        @for (
                                          candidate of expandList(
                                            group.candidates
                                          );
                                          track $index
                                        ) {
                                          <li
                                            [class.list-none]="
                                              isBulletless(candidate)
                                            "
                                            [style.list-style-type]="
                                              isSubItem(candidate)
                                                ? 'circle'
                                                : ''
                                            "
                                            [class.-ml-4]="
                                              isConnector(candidate) ||
                                              isParenthetical(candidate)
                                            "
                                            [class.font-bold]="
                                              isConnector(candidate)
                                            "
                                            [class.text-center]="
                                              isConnector(candidate)
                                            "
                                            [class.ml-6]="isSubItem(candidate)"
                                            [class.text-sm]="
                                              isParenthetical(candidate)
                                            "
                                            [class.text-slate-500]="
                                              isParenthetical(candidate)
                                            "
                                            [class.mt-2]="
                                              isParenthetical(candidate)
                                            "
                                          >
                                            <span
                                              [innerHTML]="
                                                formatTextWithNotes(
                                                  isSubItem(candidate)
                                                    ? cleanSubItem(candidate)
                                                    : candidate
                                                )
                                              "
                                            ></span>
                                          </li>
                                        }
                                      </ul>
                                    </td>
                                  }
                                  <td
                                    class="p-3 border border-slate-300 align-top"
                                  >
                                    <div class="flex gap-4">
                                      <div
                                        class="font-bold min-w-[80px] text-slate-600"
                                      >
                                        {{ req.level }}
                                      </div>
                                      <ul
                                        class="list-disc list-outside ml-4 space-y-1 flex-1"
                                      >
                                        @for (
                                          edu of expandList(req.education);
                                          track $index
                                        ) {
                                          <li
                                            [class.list-none]="
                                              isBulletless(edu)
                                            "
                                            [style.list-style-type]="
                                              isSubItem(edu) ? 'circle' : ''
                                            "
                                            [class.-ml-4]="isConnector(edu)"
                                            [class.font-bold]="isConnector(edu)"
                                            [class.text-center]="
                                              isConnector(edu)
                                            "
                                            [class.ml-6]="isSubItem(edu)"
                                            [class.text-sm]="
                                              isParenthetical(edu)
                                            "
                                            [class.text-slate-500]="
                                              isParenthetical(edu)
                                            "
                                          >
                                            <span
                                              [innerHTML]="
                                                formatTextWithNotes(
                                                  isSubItem(edu)
                                                    ? cleanSubItem(edu)
                                                    : edu
                                                )
                                              "
                                            ></span>
                                          </li>
                                        }
                                      </ul>
                                    </div>
                                  </td>
                                  <td
                                    class="p-3 border border-slate-300 align-top"
                                  >
                                    <ul
                                      class="list-disc list-outside ml-4 space-y-1"
                                    >
                                      @for (
                                        exp of expandList(req.experience);
                                        track $index
                                      ) {
                                        <li
                                          [class.list-none]="isBulletless(exp)"
                                          [style.list-style-type]="
                                            isSubItem(exp) ? 'circle' : ''
                                          "
                                          [class.-ml-4]="isConnector(exp)"
                                          [class.font-bold]="isConnector(exp)"
                                          [class.text-center]="isConnector(exp)"
                                          [class.ml-6]="isSubItem(exp)"
                                          [class.text-sm]="isParenthetical(exp)"
                                          [class.text-slate-500]="
                                            isParenthetical(exp)
                                          "
                                        >
                                          <span
                                            [innerHTML]="
                                              formatTextWithNotes(
                                                isSubItem(exp)
                                                  ? cleanSubItem(exp)
                                                  : exp
                                              )
                                            "
                                          ></span>
                                        </li>
                                      }
                                    </ul>
                                  </td>
                                </tr>
                              }
                            }
                          </tbody>
                        </table>
                      </div>

                      @if (detail.notes.length > 0) {
                        <div class="mt-6 text-xs text-slate-600">
                          <p class="font-bold mb-2">Notes</p>
                          <div class="space-y-4">
                            @for (note of detail.notes; track note) {
                              <div class="whitespace-pre-wrap">{{ note }}</div>
                            }
                          </div>
                        </div>
                      }
                    </div>
                  }
                } @else {
                  <!-- FALLBACK VIEW -->
                  <div
                    [innerHTML]="
                      job.htmlContent || formatRequirements(job.requirements)
                    "
                  ></div>
                }
              </div>
            </div>
          } @else {
            <!-- LIST VIEW -->
            <!-- Search Bar -->
            <div class="p-4 bg-slate-50 border-b border-slate-200 shrink-0">
              <div class="relative">
                <input
                  #searchInput
                  type="text"
                  placeholder="Rechercher par titre, ID, abréviation..."
                  class="w-full pl-10 pr-4 py-2 rounded-lg border border-slate-300 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition-all"
                  (input)="onSearch(searchInput.value)"
                  aria-label="Rechercher un métier"
                />
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  class="h-5 w-5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    stroke-linecap="round"
                    stroke-linejoin="round"
                    stroke-width="2"
                    d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                  />
                </svg>
              </div>
            </div>

            <!-- Results List -->
            <div class="flex-1 overflow-y-auto p-4 space-y-3 min-h-0">
              @for (job of filteredJobs(); track job.id) {
                <div
                  class="p-4 rounded-xl border border-slate-200 hover:border-indigo-300 hover:shadow-md transition-all group cursor-pointer bg-white"
                  (click)="selectJob(job)"
                >
                  <div class="flex justify-between items-start mb-2">
                    <div>
                      <h3
                        class="font-bold text-slate-800 text-lg group-hover:text-indigo-700 transition-colors"
                      >
                        {{ job.title }}
                      </h3>
                      <div
                        class="flex items-center flex-wrap gap-2 text-xs font-mono text-slate-500 mt-1"
                      >
                        <span
                          class="bg-slate-100 px-2 py-0.5 rounded border border-slate-200"
                          >ID: {{ job.id }}</span
                        >
                        <span
                          class="bg-slate-100 px-2 py-0.5 rounded border border-slate-200"
                          >{{ job.abbreviation }}</span
                        >

                        <!-- Pastilles CC et RP -->
                        @if (isJobRp(job.id)) {
                          <span
                            class="bg-blue-50 text-blue-700 px-1.5 py-0.5 rounded border border-blue-200 font-sans text-[10px] font-bold uppercase tracking-wider"
                            >CC</span
                          >
                          <span
                            class="bg-emerald-50 text-emerald-700 px-1.5 py-0.5 rounded border border-emerald-200 font-sans text-[10px] font-bold uppercase tracking-wider"
                            >RP</span
                          >
                        } @else {
                          <span
                            class="bg-blue-50 text-blue-700 px-1.5 py-0.5 rounded border border-blue-200 font-sans text-[10px] font-bold uppercase tracking-wider"
                            >CC seulement</span
                          >
                        }

                        @if (isJobClosed(job.id)) {
                          <span
                            class="bg-red-100 text-red-800 px-2 py-0.5 rounded border border-red-200 font-sans flex items-center gap-1"
                          >
                            <svg
                              xmlns="http://www.w3.org/2000/svg"
                              class="h-3.5 w-3.5"
                              fill="none"
                              viewBox="0 0 24 24"
                              stroke="currentColor"
                            >
                              <path
                                stroke-linecap="round"
                                stroke-linejoin="round"
                                stroke-width="2"
                                d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"
                              />
                            </svg>
                            Fermé (SIP)
                          </span>
                        }
                        @if (job.contracts) {
                          @for (
                            contract of job.contracts;
                            track contract.program
                          ) {
                            <span
                              class="bg-emerald-50 text-emerald-700 px-2 py-0.5 rounded border border-emerald-200"
                              title="{{ contract.program }}"
                            >
                              {{ contract.duration }}
                              @if (contract.program !== "Enrôlement direct") {
                                ({{ contract.program }})
                              }
                            </span>
                          }
                        }
                      </div>
                    </div>
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      class="h-5 w-5 text-slate-300 group-hover:text-indigo-500 transition-colors"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        stroke-linecap="round"
                        stroke-linejoin="round"
                        stroke-width="2"
                        d="M9 5l7 7-7 7"
                      />
                    </svg>
                  </div>
                  <div
                    class="text-sm text-slate-600 leading-relaxed line-clamp-2"
                  >
                    {{ job.requirements }}
                  </div>
                </div>
              } @empty {
                <div class="text-center py-12 text-slate-400">
                  <p>Aucun métier trouvé.</p>
                </div>
              }
            </div>
          }
        </div>

        <!-- TAB 2: REORIENTATION -->
        <app-reorientation
          [class.hidden]="activeTab() !== 'reorientation'"
          class="flex-1 flex flex-col min-h-0"
        ></app-reorientation>

        <!-- Resize Handle (Bottom Right) -->
        <div
          class="absolute bottom-0 right-0 w-4 h-4 cursor-nwse-resize z-50 flex items-end justify-end p-0.5"
          (mousedown)="startResize($event)"
          *ngIf="!isFullScreen()"
        >
          <div class="w-2 h-2 border-r-2 border-b-2 border-slate-400"></div>
        </div>
      </div>
    </div>
  `,
  styles: [],
})
export class JobSearchModalComponent {
  private jobService = inject(JobDatabaseService);
  private sanitizer = inject(DomSanitizer);

  activeTab = signal<ModalTab>("reorientation");

  filteredJobs = signal<JobEntry[]>(this.jobService.getAllJobs());

  // Window State
  position = signal({ x: 100, y: 100 });
  size = signal({ width: 1000, height: 800 });
  isFullScreen = signal(true);

  selectedJob = signal<JobEntry | null>(null);

  // Drag State
  private isDragging = false;
  private dragStart = { x: 0, y: 0 };
  private initialPos = { x: 0, y: 0 };

  // Resize State
  private isResizing = false;
  private resizeStart = { x: 0, y: 0 };
  private initialSize = { width: 0, height: 0 };

  @Output() closeModal = new EventEmitter<void>();
  @ViewChild(ReorientationComponent)
  reorientationComponent!: ReorientationComponent;

  get closedJobs() {
    return this.jobService.closedJobs;
  }

  isJobClosed(jobId: string): boolean {
    return this.closedJobs().has(jobId);
  }

  isJobRp(jobId: string): boolean {
    return this.jobService.isJobRp(jobId);
  }

  expandList(items: string[] | undefined): string[] {
    if (!items) return [];
    const result: string[] = [];
    for (const item of items) {
      if (!item) continue;
      const parts = item.split(/(?=\s+(?:[o•\u2022])\s+)/i);
      for (const p of parts) {
        const trimmed = p.trim();
        if (trimmed) {
          result.push(trimmed);
        }
      }
    }
    return result;
  }

  isBulletless(item: string): boolean {
    const trimmed = item.trim();
    return trimmed.startsWith("(") || trimmed === "ET" || trimmed === "OU";
  }

  isConnector(item: string): boolean {
    const trimmed = item.trim();
    return trimmed === "ET" || trimmed === "OU";
  }

  isSubItem(item: string): boolean {
    const trimmed = item.trim();
    return (
      /^o\s+/i.test(trimmed) ||
      /^\-\s+/.test(trimmed) ||
      /^[a-z]\.\s+/i.test(trimmed) ||
      /^•\s+/.test(trimmed)
    );
  }

  cleanSubItem(item: string): string {
    return item
      .replace(/^[\s]*[o\-•]\s+/i, "")
      .replace(/^[\s]*[a-z]\.\s+/i, "");
  }

  isParenthetical(item: string): boolean {
    return item.trim().startsWith("(");
  }

  formatTextWithNotes(text: string) {
    // Escape HTML from input text just in case, before applying our tags
    const htmlEscaped = text.replace(/</g, "&lt;").replace(/>/g, "&gt;");

    // First, match embedded notes that follow specific keywords
    // Keywords: NOC, NPC, QE, suivants, libération, actuel, PM, etc.
    const embeddedRegex =
      /(^|[^\p{L}\p{N}])(NOC|NPC|NQ|suivants|suivantes|libération|actuel|actuelle|précédent|précédents|précédente|précédentes|années|civil|agréé|accrédité|EDO|Autorisation|Canada|vitae|D\.M\.D\.|professionnelle|Pharmacie|entrée|tertiaires|MÉ|cycle|autorisé|social|restriction|territoriale|M\.S\.S\.|clinique|OAP|Sgt\/M|Sgt|règle|RECL|PSAC|Candidat|candidats|PFOR|PMEP|PFUMR|PFOEP|PIOSR|PNSCO|MÉC|TECH|SUR|SAP|ADJUC|baccalauréat|expérience|diplôme|certificat|programme|professionnel|cours|OFP|GÉNIE|santé|dentaire|ESNEM|Critique|PMED|PFDM|MSÉ|pratique|infirmiers|chacun|ES-PMNE|stages)([^\p{L}\p{N}]{1,4}?)((?:[1-9]|1[0-9]|20)(?:,\s*(?:[1-9]|1[0-9]|20))*)(?=$|[^\p{L}\p{N}])/giu;

    let formatted = htmlEscaped.replace(
      embeddedRegex,
      (match, prefix, keyword, space, notes) => {
        // Split by comma to check if any of the numbers are > 20, just to be safe
        const maybeNotes = notes
          .split(",")
          .map((n: string) => parseInt(n.trim(), 10));
        if (maybeNotes.some((n: number) => n > 20)) {
          return match; // Don't format if there are numbers > 20
        }

        // We reconstruct the string so we only wrap the number part
        const styledNotes = `<sup class="text-indigo-600 font-bold bg-indigo-50 px-1 py-0.5 rounded ml-1 tracking-tighter">${notes}</sup>`;
        return prefix + keyword + space + styledNotes;
      },
    );

    // We match space followed by 1 to 20, optionally separated by commas, at the end of string or right before a colon
    const endRegex =
      /\s+((?:[1-9]|1[0-9]|20)(?:,\s*(?:[1-9]|1[0-9]|20))*)(?:\s*:)?$/g;

    formatted = formatted.replace(endRegex, (match, notes) => {
      // Split by comma to check if any of the numbers are > 20, just to be safe
      const maybeNotes = notes
        .split(",")
        .map((n: string) => parseInt(n.trim(), 10));
      if (maybeNotes.some((n: number) => n > 20)) {
        return match; // Don't format if there are numbers > 20
      }

      const hasColon = match.includes(":");
      const suffix = hasColon ? " :" : "";

      return ` <sup class="text-indigo-600 font-bold bg-indigo-50 px-1 py-0.5 rounded ml-1 tracking-tighter">${notes}</sup>${suffix}`;
    });

    return this.sanitizer.bypassSecurityTrustHtml(formatted);
  }

  constructor() {
    // Global event listeners for drag/resize end
    window.addEventListener("mousemove", this.onMouseMove.bind(this));
    window.addEventListener("mouseup", this.onMouseUp.bind(this));
  }

  onSearch(query: string) {
    this.filteredJobs.set(this.jobService.searchJobs(query));
  }

  selectJob(job: JobEntry) {
    this.selectedJob.set(job);
  }

  clearSelection() {
    this.selectedJob.set(null);
    this.onSearch("");
  }

  formatRequirements(req: string | undefined): SafeHtml {
    if (!req) return "";

    // Check if we have both Force Reguliere and Force de Reserve
    const regForceMatch = req.match(
      /FORCE RÉGULIÈRE:(.*?)(?=FORCE DE RÉSERVE:|$)/i,
    );
    const resForceMatch = req.match(/FORCE DE RÉSERVE:(.*)/i);

    if (regForceMatch) {
      const regText = regForceMatch[1].trim();
      const resText = resForceMatch ? resForceMatch[1].trim() : null;

      let html = '<div class="grid grid-cols-1 md:grid-cols-2 gap-6">';

      // Regular Force Column
      html += `
        <div class="bg-slate-50 p-5 rounded-xl border border-slate-200 shadow-sm">
          <h3 class="font-bold text-indigo-900 mb-3 border-b border-indigo-200 pb-2 flex items-center gap-2">
            <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
            </svg>
            FORCE RÉGULIÈRE
          </h3>
          <div class="text-sm text-slate-700 space-y-2">
            ${this.formatList(regText)}
          </div>
        </div>
      `;

      // Reserve Force Column (if exists)
      if (resText) {
        html += `
          <div class="bg-slate-50 p-5 rounded-xl border border-slate-200 shadow-sm">
            <h3 class="font-bold text-indigo-900 mb-3 border-b border-indigo-200 pb-2 flex items-center gap-2">
              <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
              FORCE DE RÉSERVE
            </h3>
            <div class="text-sm text-slate-700 space-y-2">
              ${this.formatList(resText)}
            </div>
          </div>
        `;
      }

      html += "</div>";
      return this.sanitizer.bypassSecurityTrustHtml(html);
    }

    // Fallback simple formatting
    const simpleHtml = req
      .replace(
        /(FORCE RÉGULIÈRE|FORCE DE RÉSERVE)/g,
        '<br><br><strong class="text-indigo-900">$1</strong><br>',
      )
      .replace(/^<br><br>/, "");

    return this.sanitizer.bypassSecurityTrustHtml(simpleHtml);
  }

  private formatList(text: string): string {
    // Split by periods to make a list, but only if sentences are long enough
    const sentences = text
      .split(".")
      .map((s) => s.trim())
      .filter((s) => s.length > 0);
    if (sentences.length > 1) {
      return `<ul class="list-disc list-outside ml-4 space-y-1">
        ${sentences.map((s) => `<li>${s}.</li>`).join("")}
      </ul>`;
    }
    return `<p>${text}</p>`;
  }

  close() {
    this.closeModal.emit();
  }

  toggleFullScreen() {
    this.isFullScreen.update((v) => !v);
  }

  // --- Drag Logic ---
  startDrag(e: MouseEvent) {
    if (this.isFullScreen()) return;
    this.isDragging = true;
    this.dragStart = { x: e.clientX, y: e.clientY };
    this.initialPos = { ...this.position() };
    e.preventDefault(); // Prevent text selection
  }

  // --- Resize Logic ---
  startResize(e: MouseEvent) {
    if (this.isFullScreen()) return;
    this.isResizing = true;
    this.resizeStart = { x: e.clientX, y: e.clientY };
    this.initialSize = { ...this.size() };
    e.stopPropagation(); // Prevent drag
    e.preventDefault();
  }

  onMouseMove(e: MouseEvent) {
    if (this.isDragging) {
      const dx = e.clientX - this.dragStart.x;
      const dy = e.clientY - this.dragStart.y;
      this.position.set({
        x: this.initialPos.x + dx,
        y: this.initialPos.y + dy,
      });
    } else if (this.isResizing) {
      const dx = e.clientX - this.resizeStart.x;
      const dy = e.clientY - this.resizeStart.y;
      this.size.set({
        width: Math.max(300, this.initialSize.width + dx),
        height: Math.max(200, this.initialSize.height + dy),
      });
    }
  }

  onMouseUp() {
    this.isDragging = false;
    this.isResizing = false;
  }
}
