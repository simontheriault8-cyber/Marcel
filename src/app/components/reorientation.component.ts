import { Component, computed, signal, inject } from "@angular/core";
import { CommonModule } from "@angular/common";
import { FormsModule } from "@angular/forms";
import { JobDatabaseService } from "../../services/job-database.service";
import { SharedStateService } from "../../services/shared-state.service";

interface ManualCriterion {
  id: string;
  label: string;
  category:
    | "Scolarité"
    | "Expérience"
    | "Année scolaire"
    | "Langue"
    | "Science"
    | "Informatique"
    | "Cours spécialisés"
    | "Universitaire 1er cycle"
    | "Universitaire cycle supérieur";
  subCategory?: string;
}

interface JobRule {
  requiredCriteriaIds?: string[];
  customCheck?: (
    selected: Set<string>,
    criteriaCoursSpecialiseIds: string[],
  ) => boolean;
  jobs: string[];
  allowPR?: boolean;
}

@Component({
  selector: "app-reorientation",
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="h-full flex flex-col min-h-0 bg-slate-50">
      <div
        class="p-4 bg-white border-b border-slate-200 shrink-0 flex items-start justify-between"
      >
        <div class="flex items-start gap-4">
          <button
            (click)="resetAll()"
            class="bg-white p-2 rounded-full shadow-md hover:bg-slate-50 transition-all text-slate-600 shrink-0 border border-slate-200 mt-1"
            title="Réinitialiser"
          >
            <svg
              class="w-5 h-5"
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              stroke-width="2"
              stroke-linecap="round"
              stroke-linejoin="round"
            >
              <path d="M3 12a9 9 0 1 0 9-9 9.75 9.75 0 0 0-6.74 2.74L3 8" />
              <path d="M3 3v5h5" />
            </svg>
          </button>
          <div>
            <h2 class="text-xl font-bold text-slate-800">
              Panneau de Réorientation
            </h2>
            <p class="text-sm text-slate-500 mt-1">
              Évaluation manuelle - Sélectionnez les critères rencontrés par le
              postulant pour évaluer son profil et générer les options de
              réorientation.
            </p>
          </div>
        </div>
        <div class="flex items-center gap-3 mt-1">
          <label
            class="flex items-center gap-2 text-sm font-semibold text-slate-700 cursor-pointer select-none"
          >
            <input
              type="checkbox"
              class="peer h-4 w-4 appearance-none rounded border border-slate-300 bg-white checked:bg-indigo-600 checked:border-indigo-600 focus:outline-none transition-all"
              [checked]="sharedState.includeLinkedEmail()"
              (change)="toggleIncludeReo()"
            />
            <span class="relative">
              <svg
                class="absolute -left-[1.15rem] top-1/2 -translate-y-1/2 w-3 h-3 text-white opacity-0 peer-checked:opacity-100 pointer-events-none transition-opacity"
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                stroke-width="3"
                stroke-linecap="round"
                stroke-linejoin="round"
              >
                <polyline points="20 6 9 17 4 12"></polyline>
              </svg>
              Lier courriel et note
            </span>
          </label>
        </div>
      </div>

      <div
        class="flex-1 overflow-y-auto p-4 flex flex-col lg:flex-row gap-6 min-h-0"
      >
        <!-- Colonne de gauche: Critères -->
        <div
          class="flex flex-col gap-6 transition-all duration-300"
          [class.lg:w-7/12]="eligibleJobs().length > 0"
          [class.w-full]="eligibleJobs().length === 0"
          [class.max-w-4xl]="eligibleJobs().length === 0"
          [class.mx-auto]="eligibleJobs().length === 0"
        >
          <!-- Age and Citizenship -->
          <div
            class="grid grid-cols-1 md:grid-cols-2 gap-4 p-4 bg-white border border-slate-200 rounded-xl shadow-sm shrink-0"
          >
            <div>
              <label class="block text-sm font-semibold text-slate-700 mb-1"
                >Âge du postulant</label
              >
              <input
                type="number"
                [(ngModel)]="age"
                class="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-shadow"
                placeholder="Ex: 18"
              />
            </div>
            <div>
              <label class="block text-sm font-semibold text-slate-700 mb-1"
                >Statut de citoyenneté</label
              >
              <select
                [(ngModel)]="citizenship"
                class="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-shadow"
              >
                <option value="Canadian Citizen">Citoyen canadien</option>
                <option value="PR > 3 years">
                  Résident permanent admissible
                </option>
                <option value="PR < 3 years">
                  Résident permanent inadmissible
                </option>
              </select>
            </div>
          </div>

          <!-- Message d'admissibilité pour RP < 3 ans -->
          <div
            *ngIf="citizenship() === 'PR < 3 years'"
            class="p-4 bg-red-50 border border-red-200 text-red-800 rounded-xl flex items-start gap-3 shadow-sm transition-all duration-300 shrink-0"
          >
            <svg
              class="w-5 h-5 text-red-600 shrink-0 mt-0.5"
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              stroke-width="2"
              stroke-linecap="round"
              stroke-linejoin="round"
            >
              <circle cx="12" cy="12" r="10"></circle>
              <line x1="12" y1="8" x2="12" y2="12"></line>
              <line x1="12" y1="16" x2="12.01" y2="16"></line>
            </svg>
            <div>
              <p class="font-bold text-sm">Non admissible</p>
              <p class="text-xs text-red-700 mt-0.5">
                Les résidents permanents de moins de trois ans ne sont pas
                admissibles aux Forces armées canadiennes.
              </p>
            </div>
          </div>

          <!-- Message pour limite d'âge de retraite forcée (âge >= 60) -->
          <div
            *ngIf="age() !== null && age()! >= 60"
            class="p-4 bg-red-50 border border-red-200 text-red-800 rounded-xl flex items-start gap-3 shadow-sm transition-all duration-300 shrink-0"
          >
            <svg
              class="w-5 h-5 text-red-600 shrink-0 mt-0.5"
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              stroke-width="2"
              stroke-linecap="round"
              stroke-linejoin="round"
            >
              <circle cx="12" cy="12" r="10"></circle>
              <line x1="12" y1="8" x2="12" y2="12"></line>
              <line x1="12" y1="16" x2="12.01" y2="16"></line>
            </svg>
            <div>
              <p class="font-bold text-sm">
                Âge limite dépassé (Retraite forcée)
              </p>
              <p class="text-xs text-red-700 mt-0.5">
                L'âge maximal de service est de 59 ans. À 60 ans ou plus, un
                postulant ne peut pas s'enrôler car la retraite forcée
                s'applique.
              </p>
            </div>
          </div>
          <!-- Panneau: Métiers déjà au dossier du postulant -->
          <div
            class="p-5 bg-white border border-slate-200 rounded-xl shadow-sm hover:shadow-md transition-shadow shrink-0 flex flex-col gap-4"
          >
            <div>
              <h3
                class="text-md font-bold text-slate-800 flex items-center gap-2"
              >
                <svg
                  class="w-5 h-5 text-indigo-600"
                  xmlns="http://www.w3.org/2000/svg"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  stroke-width="2.5"
                  stroke-linecap="round"
                  stroke-linejoin="round"
                >
                  <path
                    d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"
                  ></path>
                  <polyline points="14 2 14 8 20 8"></polyline>
                  <line x1="16" y1="13" x2="8" y2="13"></line>
                  <line x1="16" y1="17" x2="8" y2="17"></line>
                  <polyline points="10 9 9 9 8 9"></polyline>
                </svg>
                Métiers déjà au dossier du postulant
              </h3>
              <p class="text-xs text-slate-500 mt-1">
                Recherchez et sélectionnez jusqu'à trois métiers déjà inscrits
                dans le dossier du candidat pour évaluer instantanément son
                admissibilité réglementaire (âge de retraite forcée,
                citoyenneté, et scolarité requise).
              </p>
            </div>

            <div class="grid grid-cols-1 lg:grid-cols-3 gap-4">
              <!-- Field 1 -->
              <div
                class="relative flex flex-col gap-2 p-4 bg-slate-50/50 border border-slate-200 rounded-xl"
              >
                <div class="flex items-center justify-between">
                  <span
                    class="text-xs font-bold uppercase tracking-wider text-slate-500"
                    >Choix Métier #1</span
                  >
                  <button
                    *ngIf="hasSelected(1)"
                    (click)="clearDossierJob(1, $event)"
                    class="text-xs text-rose-500 hover:text-rose-700 font-semibold transition flex items-center gap-0.5"
                  >
                    <svg
                      class="w-3.5 h-3.5"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        stroke-linecap="round"
                        stroke-linejoin="round"
                        stroke-width="2.5"
                        d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                      />
                    </svg>
                    Retirer
                  </button>
                </div>

                <div class="relative">
                  <div
                    class="flex items-center border border-slate-300 rounded-lg bg-white shadow-xs focus-within:ring-2 focus-within:ring-indigo-500 focus-within:border-indigo-500"
                    [class.opacity-50]="isFieldDisabled(1)"
                    [class.bg-slate-100]="isFieldDisabled(1)"
                    [class.cursor-not-allowed]="isFieldDisabled(1)"
                  >
                    <input
                      type="text"
                      [ngModel]="searchDossierQuery1()"
                      (ngModelChange)="onQueryChange(1, $event)"
                      (focus)="openDropdown(1)"
                      (blur)="closeDropdownDelayed(1)"
                      [disabled]="isFieldDisabled(1)"
                      class="w-full px-3 py-2 text-sm outline-none bg-transparent"
                      [class.cursor-not-allowed]="isFieldDisabled(1)"
                      placeholder="Rechercher..."
                    />
                    <button
                      *ngIf="!dropdownOpen1() && !isFieldDisabled(1)"
                      class="p-1 px-2 text-slate-400"
                      (click)="openDropdown(1)"
                    >
                      <svg
                        class="w-4 h-4"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                      >
                        <path
                          stroke-linecap="round"
                          stroke-linejoin="round"
                          stroke-width="2"
                          d="M19 9l-7 7-7-7"
                        />
                      </svg>
                    </button>
                    <button
                      *ngIf="dropdownOpen1() && !isFieldDisabled(1)"
                      class="p-1 px-2 text-slate-400"
                    >
                      <svg
                        class="w-4 h-4 transform rotate-180"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                      >
                        <path
                          stroke-linecap="round"
                          stroke-linejoin="round"
                          stroke-width="2"
                          d="M19 9l-7 7-7-7"
                        />
                      </svg>
                    </button>
                  </div>

                  <!-- Dropdown Search Results -->
                  <div
                    *ngIf="dropdownOpen1()"
                    class="absolute z-50 left-0 right-0 mt-1 max-h-56 overflow-y-auto bg-white border border-slate-200 rounded-lg shadow-lg"
                  >
                    @if (filteredDossierJobs1().length === 0) {
                      <div class="p-3 text-xs text-slate-500 italic">
                        Aucun métier trouvé
                      </div>
                    } @else {
                      @for (job of filteredDossierJobs1(); track job.id) {
                        <button
                          (click)="selectDossierJob(1, job.id)"
                          class="w-full text-left px-3 py-2 text-xs hover:bg-slate-50 transition-colors flex items-center justify-between border-b border-slate-100 last:border-0"
                        >
                          <span class="text-slate-800 font-medium"
                            ><span class="font-bold text-indigo-600 mr-1"
                              >[{{ job.id }}]</span
                            >
                            {{ job.title }}</span
                          >
                        </button>
                      }
                    }
                  </div>
                </div>

                <!-- Admissibility Box for Field 1 -->
                @if (selectedDossierJobId1()) {
                  @let s1 = evaluateJobAdmissibility(selectedDossierJobId1());
                  @if (s1) {
                    <div
                      class="mt-2 p-3 rounded-lg border text-xs bg-white"
                      [class.bg-emerald-50]="s1.isEligible"
                      [class.border-emerald-200]="s1.isEligible"
                      [class.bg-rose-50]="!s1.isEligible"
                      [class.border-rose-200]="!s1.isEligible"
                    >
                      <div
                        class="flex items-center justify-between font-bold mb-1"
                        [class.text-emerald-800]="s1.isEligible"
                        [class.text-rose-800]="!s1.isEligible"
                      >
                        <span>{{
                          s1.isEligible ? "ADMISSIBLE" : "NON ADMISSIBLE"
                        }}</span>
                        <span
                          class="text-[10px] font-mono bg-white/50 px-1 py-0.5 rounded"
                          >ID {{ s1.job.id }}</span
                        >
                      </div>
                      <p class="font-semibold text-slate-700 truncate mb-2">
                        {{ s1.job.title }}
                      </p>

                      @if (s1.job.id !== '00003') {
                        <div class="space-y-1 text-[11px] text-slate-600">
                          <!-- Age detail -->
                          <div class="flex items-start gap-1">
                            <span
                              class="font-bold"
                              [class.text-emerald-600]="s1.isAgeAdmissible"
                              [class.text-rose-600]="!s1.isAgeAdmissible"
                            >
                              {{ s1.isAgeAdmissible ? "✓" : "✗" }}
                            </span>
                            <div>
                              <span class="font-semibold">Âge : </span>
                              @if (age() === null || age()! <= 0) {
                                <span class="italic text-slate-500"
                                  >Non renseigné (Contrat :
                                  {{ s1.durationYears }} ans - âge max:
                                  {{ 60 - s1.durationYears }} ans)</span
                                >
                              } @else {
                                <span
                                  >{{ age() }} ans.
                                  @if (!s1.isAgeAdmissible) {
                                    {{ s1.ageReason }}
                                  } @else {
                                    OK (Contrat {{ s1.durationYears }} ans).
                                  }
                                </span>
                              }
                            </div>
                          </div>

                          <!-- Citizenship detail -->
                          <div class="flex items-start gap-1">
                            <span
                              class="font-bold"
                              [class.text-emerald-600]="
                                s1.isCitizenshipAdmissible
                              "
                              [class.text-rose-600]="!s1.isCitizenshipAdmissible"
                            >
                              {{ s1.isCitizenshipAdmissible ? "✓" : "✗" }}
                            </span>
                            <div>
                              <span class="font-semibold">Statut : </span>
                              <span>
                                @if (citizenship() === "Canadian Citizen") {
                                  Citoyen canadien (OK).
                                } @else if (citizenship() === "PR > 3 years") {
                                  R.P. > 3 ans.
                                  @if (!s1.isCitizenshipAdmissible) {
                                    {{ s1.citizenshipReason }}
                                  } @else {
                                    OK.
                                  }
                                } @else {
                                  R.P. < 3 ans (Inadmissible).
                                }
                              </span>
                            </div>
                          </div>

                          <!-- Qualifications detail -->
                          <div class="flex items-start gap-1">
                            <span
                              class="font-bold"
                              [class.text-emerald-600]="s1.isEducationAdmissible"
                              [class.text-rose-600]="!s1.isEducationAdmissible"
                            >
                              {{ s1.isEducationAdmissible ? "✓" : "✗" }}
                            </span>
                            <div>
                              <span class="font-semibold">Scolarité : </span>
                              <span
                                [class.text-rose-700]="!s1.isEducationAdmissible"
                                [class.text-emerald-700]="
                                  s1.isEducationAdmissible
                                "
                              >
                                {{
                                  s1.isEducationAdmissible
                                    ? "Scolarité/expérience rencontrée (OK)."
                                    : "Scolarité/expérience non rencontrée."
                                }}
                              </span>
                            </div>
                          </div>
                        </div>

                        <!-- SIP Status Warning -->
                        @if (s1.isJobClosed) {
                          <div
                            class="mt-2 p-1.5 bg-red-100 text-red-800 rounded border border-red-200 flex items-start gap-1.5 font-semibold text-[10px] leading-tight"
                          >
                            <span>⚠</span>
                            <div>
                              Ce métier est présentement FERMÉ dans le SIP
                              (aucune vacance).
                            </div>
                          </div>
                        }
                      }
                    </div>
                  }
                }
              </div>

              <!-- Field 2 -->
              <div
                class="relative flex flex-col gap-2 p-4 bg-slate-50/50 border border-slate-200 rounded-xl"
              >
                <div class="flex items-center justify-between">
                  <span
                    class="text-xs font-bold uppercase tracking-wider text-slate-500"
                    >Choix Métier #2</span
                  >
                  <button
                    *ngIf="hasSelected(2)"
                    (click)="clearDossierJob(2, $event)"
                    class="text-xs text-rose-500 hover:text-rose-700 font-semibold transition flex items-center gap-0.5"
                  >
                    <svg
                      class="w-3.5 h-3.5"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        stroke-linecap="round"
                        stroke-linejoin="round"
                        stroke-width="2.5"
                        d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                      />
                    </svg>
                    Retirer
                  </button>
                </div>

                <div class="relative">
                  <div
                    class="flex items-center border border-slate-300 rounded-lg bg-white shadow-xs focus-within:ring-2 focus-within:ring-indigo-500 focus-within:border-indigo-500"
                    [class.opacity-50]="isFieldDisabled(2)"
                    [class.bg-slate-100]="isFieldDisabled(2)"
                    [class.cursor-not-allowed]="isFieldDisabled(2)"
                  >
                    <input
                      type="text"
                      [ngModel]="searchDossierQuery2()"
                      (ngModelChange)="onQueryChange(2, $event)"
                      (focus)="openDropdown(2)"
                      (blur)="closeDropdownDelayed(2)"
                      [disabled]="isFieldDisabled(2)"
                      class="w-full px-3 py-2 text-sm outline-none bg-transparent"
                      [class.cursor-not-allowed]="isFieldDisabled(2)"
                      placeholder="Rechercher..."
                    />
                    <button
                      *ngIf="!dropdownOpen2() && !isFieldDisabled(2)"
                      class="p-1 px-2 text-slate-400"
                      (click)="openDropdown(2)"
                    >
                      <svg
                        class="w-4 h-4"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                      >
                        <path
                          stroke-linecap="round"
                          stroke-linejoin="round"
                          stroke-width="2"
                          d="M19 9l-7 7-7-7"
                        />
                      </svg>
                    </button>
                    <button
                      *ngIf="dropdownOpen2() && !isFieldDisabled(2)"
                      class="p-1 px-2 text-slate-400"
                    >
                      <svg
                        class="w-4 h-4 transform rotate-180"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                      >
                        <path
                          stroke-linecap="round"
                          stroke-linejoin="round"
                          stroke-width="2"
                          d="M19 9l-7 7-7-7"
                        />
                      </svg>
                    </button>
                  </div>

                  <!-- Dropdown Search Results -->
                  <div
                    *ngIf="dropdownOpen2()"
                    class="absolute z-50 left-0 right-0 mt-1 max-h-56 overflow-y-auto bg-white border border-slate-200 rounded-lg shadow-lg"
                  >
                    @if (filteredDossierJobs2().length === 0) {
                      <div class="p-3 text-xs text-slate-500 italic">
                        Aucun métier trouvé
                      </div>
                    } @else {
                      @for (job of filteredDossierJobs2(); track job.id) {
                        <button
                          (click)="selectDossierJob(2, job.id)"
                          class="w-full text-left px-3 py-2 text-xs hover:bg-slate-50 transition-colors flex items-center justify-between border-b border-slate-100 last:border-0"
                        >
                          <span class="text-slate-800 font-medium"
                            ><span class="font-bold text-indigo-600 mr-1"
                              >[{{ job.id }}]</span
                            >
                            {{ job.title }}</span
                          >
                        </button>
                      }
                    }
                  </div>
                </div>

                <!-- Admissibility Box for Field 2 -->
                @if (selectedDossierJobId2()) {
                  @let s2 = evaluateJobAdmissibility(selectedDossierJobId2());
                  @if (s2) {
                    <div
                      class="mt-2 p-3 rounded-lg border text-xs bg-white"
                      [class.bg-emerald-50]="s2.isEligible"
                      [class.border-emerald-200]="s2.isEligible"
                      [class.bg-rose-50]="!s2.isEligible"
                      [class.border-rose-200]="!s2.isEligible"
                    >
                      <div
                        class="flex items-center justify-between font-bold mb-1"
                        [class.text-emerald-800]="s2.isEligible"
                        [class.text-rose-800]="!s2.isEligible"
                      >
                        <span>{{
                          s2.isEligible ? "ADMISSIBLE" : "NON ADMISSIBLE"
                        }}</span>
                        <span
                          class="text-[10px] font-mono bg-white/50 px-1 py-0.5 rounded"
                          >ID {{ s2.job.id }}</span
                        >
                      </div>
                      <p class="font-semibold text-slate-700 truncate mb-2">
                        {{ s2.job.title }}
                      </p>

                      @if (s2.job.id !== '00003') {
                        <div class="space-y-1 text-[11px] text-slate-600">
                          <!-- Age detail -->
                          <div class="flex items-start gap-1">
                            <span
                              class="font-bold"
                              [class.text-emerald-600]="s2.isAgeAdmissible"
                              [class.text-rose-600]="!s2.isAgeAdmissible"
                            >
                              {{ s2.isAgeAdmissible ? "✓" : "✗" }}
                            </span>
                            <div>
                              <span class="font-semibold">Âge : </span>
                              @if (age() === null || age()! <= 0) {
                                <span class="italic text-slate-500"
                                  >Non renseigné (Contrat :
                                  {{ s2.durationYears }} ans - âge max:
                                  {{ 60 - s2.durationYears }} ans)</span
                                >
                              } @else {
                                <span
                                  >{{ age() }} ans.
                                  @if (!s2.isAgeAdmissible) {
                                    {{ s2.ageReason }}
                                  } @else {
                                    OK (Contrat {{ s2.durationYears }} ans).
                                  }
                                </span>
                              }
                            </div>
                          </div>

                          <!-- Citizenship detail -->
                          <div class="flex items-start gap-1">
                            <span
                              class="font-bold"
                              [class.text-emerald-600]="
                                s2.isCitizenshipAdmissible
                              "
                              [class.text-rose-600]="!s2.isCitizenshipAdmissible"
                            >
                              {{ s2.isCitizenshipAdmissible ? "✓" : "✗" }}
                            </span>
                            <div>
                              <span class="font-semibold">Statut : </span>
                              <span>
                                @if (citizenship() === "Canadian Citizen") {
                                  Citoyen canadien (OK).
                                } @else if (citizenship() === "PR > 3 years") {
                                  R.P. > 3 ans.
                                  @if (!s2.isCitizenshipAdmissible) {
                                    {{ s2.citizenshipReason }}
                                  } @else {
                                    OK.
                                  }
                                } @else {
                                  R.P. < 3 ans (Inadmissible).
                                }
                              </span>
                            </div>
                          </div>

                          <!-- Qualifications detail -->
                          <div class="flex items-start gap-1">
                            <span
                              class="font-bold"
                              [class.text-emerald-600]="s2.isEducationAdmissible"
                              [class.text-rose-600]="!s2.isEducationAdmissible"
                            >
                              {{ s2.isEducationAdmissible ? "✓" : "✗" }}
                            </span>
                            <div>
                              <span class="font-semibold">Scolarité : </span>
                              <span
                                [class.text-rose-700]="!s2.isEducationAdmissible"
                                [class.text-emerald-700]="
                                  s2.isEducationAdmissible
                                "
                              >
                                {{
                                  s2.isEducationAdmissible
                                    ? "Scolarité/expérience rencontrée (OK)."
                                    : "Scolarité/expérience non rencontrée."
                                }}
                              </span>
                            </div>
                          </div>
                        </div>

                        <!-- SIP Status Warning -->
                        @if (s2.isJobClosed) {
                          <div
                            class="mt-2 p-1.5 bg-red-100 text-red-800 rounded border border-red-200 flex items-start gap-1.5 font-semibold text-[10px] leading-tight"
                          >
                            <span>⚠</span>
                            <div>
                              Ce métier est présentement FERMÉ dans le SIP
                              (aucune vacance).
                            </div>
                          </div>
                        }
                      }
                    </div>
                  }
                }
              </div>

              <!-- Field 3 -->
              <div
                class="relative flex flex-col gap-2 p-4 bg-slate-50/50 border border-slate-200 rounded-xl"
              >
                <div class="flex items-center justify-between">
                  <span
                    class="text-xs font-bold uppercase tracking-wider text-slate-500"
                    >Choix Métier #3</span
                  >
                  <button
                    *ngIf="hasSelected(3)"
                    (click)="clearDossierJob(3, $event)"
                    class="text-xs text-rose-500 hover:text-rose-700 font-semibold transition flex items-center gap-0.5"
                  >
                    <svg
                      class="w-3.5 h-3.5"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        stroke-linecap="round"
                        stroke-linejoin="round"
                        stroke-width="2.5"
                        d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                      />
                    </svg>
                    Retirer
                  </button>
                </div>

                <div class="relative">
                  <div
                    class="flex items-center border border-slate-300 rounded-lg bg-white shadow-xs focus-within:ring-2 focus-within:ring-indigo-500 focus-within:border-indigo-500"
                    [class.opacity-50]="isFieldDisabled(3)"
                    [class.bg-slate-100]="isFieldDisabled(3)"
                    [class.cursor-not-allowed]="isFieldDisabled(3)"
                  >
                    <input
                      type="text"
                      [ngModel]="searchDossierQuery3()"
                      (ngModelChange)="onQueryChange(3, $event)"
                      (focus)="openDropdown(3)"
                      (blur)="closeDropdownDelayed(3)"
                      [disabled]="isFieldDisabled(3)"
                      class="w-full px-3 py-2 text-sm outline-none bg-transparent"
                      [class.cursor-not-allowed]="isFieldDisabled(3)"
                      placeholder="Rechercher..."
                    />
                    <button
                      *ngIf="!dropdownOpen3() && !isFieldDisabled(3)"
                      class="p-1 px-2 text-slate-400"
                      (click)="openDropdown(3)"
                    >
                      <svg
                        class="w-4 h-4"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                      >
                        <path
                          stroke-linecap="round"
                          stroke-linejoin="round"
                          stroke-width="2"
                          d="M19 9l-7 7-7-7"
                        />
                      </svg>
                    </button>
                    <button
                      *ngIf="dropdownOpen3() && !isFieldDisabled(3)"
                      class="p-1 px-2 text-slate-400"
                    >
                      <svg
                        class="w-4 h-4 transform rotate-180"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                      >
                        <path
                          stroke-linecap="round"
                          stroke-linejoin="round"
                          stroke-width="2"
                          d="M19 9l-7 7-7-7"
                        />
                      </svg>
                    </button>
                  </div>

                  <!-- Dropdown Search Results -->
                  <div
                    *ngIf="dropdownOpen3()"
                    class="absolute z-50 left-0 right-0 mt-1 max-h-56 overflow-y-auto bg-white border border-slate-200 rounded-lg shadow-lg"
                  >
                    @if (filteredDossierJobs3().length === 0) {
                      <div class="p-3 text-xs text-slate-500 italic">
                        Aucun métier trouvé
                      </div>
                    } @else {
                      @for (job of filteredDossierJobs3(); track job.id) {
                        <button
                          (click)="selectDossierJob(3, job.id)"
                          class="w-full text-left px-3 py-2 text-xs hover:bg-slate-50 transition-colors flex items-center justify-between border-b border-slate-100 last:border-0"
                        >
                          <span class="text-slate-800 font-medium"
                            ><span class="font-bold text-indigo-600 mr-1"
                              >[{{ job.id }}]</span
                            >
                            {{ job.title }}</span
                          >
                        </button>
                      }
                    }
                  </div>
                </div>

                <!-- Admissibility Box for Field 3 -->
                @if (selectedDossierJobId3()) {
                  @let s3 = evaluateJobAdmissibility(selectedDossierJobId3());
                  @if (s3) {
                    <div
                      class="mt-2 p-3 rounded-lg border text-xs bg-white"
                      [class.bg-emerald-50]="s3.isEligible"
                      [class.border-emerald-200]="s3.isEligible"
                      [class.bg-rose-50]="!s3.isEligible"
                      [class.border-rose-200]="!s3.isEligible"
                    >
                      <div
                        class="flex items-center justify-between font-bold mb-1"
                        [class.text-emerald-800]="s3.isEligible"
                        [class.text-rose-800]="!s3.isEligible"
                      >
                        <span>{{
                          s3.isEligible ? "ADMISSIBLE" : "NON ADMISSIBLE"
                        }}</span>
                        <span
                          class="text-[10px] font-mono bg-white/50 px-1 py-0.5 rounded"
                          >ID {{ s3.job.id }}</span
                        >
                      </div>
                      <p class="font-semibold text-slate-700 truncate mb-2">
                        {{ s3.job.title }}
                      </p>

                      @if (s3.job.id !== '00003') {
                        <div class="space-y-1 text-[11px] text-slate-600">
                          <!-- Age detail -->
                          <div class="flex items-start gap-1">
                            <span
                              class="font-bold"
                              [class.text-emerald-600]="s3.isAgeAdmissible"
                              [class.text-rose-600]="!s3.isAgeAdmissible"
                            >
                              {{ s3.isAgeAdmissible ? "✓" : "✗" }}
                            </span>
                            <div>
                              <span class="font-semibold">Âge : </span>
                              @if (age() === null || age()! <= 0) {
                                <span class="italic text-slate-500"
                                  >Non renseigné (Contrat :
                                  {{ s3.durationYears }} ans - âge max:
                                  {{ 60 - s3.durationYears }} ans)</span
                                >
                              } @else {
                                <span
                                  >{{ age() }} ans.
                                  @if (!s3.isAgeAdmissible) {
                                    {{ s3.ageReason }}
                                  } @else {
                                    OK (Contrat {{ s3.durationYears }} ans).
                                  }
                                </span>
                              }
                            </div>
                          </div>

                          <!-- Citizenship detail -->
                          <div class="flex items-start gap-1">
                            <span
                              class="font-bold"
                              [class.text-emerald-600]="
                                s3.isCitizenshipAdmissible
                              "
                              [class.text-rose-600]="!s3.isCitizenshipAdmissible"
                            >
                              {{ s3.isCitizenshipAdmissible ? "✓" : "✗" }}
                            </span>
                            <div>
                              <span class="font-semibold">Statut : </span>
                              <span>
                                @if (citizenship() === "Canadian Citizen") {
                                  Citoyen canadien (OK).
                                } @else if (citizenship() === "PR > 3 years") {
                                  R.P. > 3 ans.
                                  @if (!s3.isCitizenshipAdmissible) {
                                    {{ s3.citizenshipReason }}
                                  } @else {
                                    OK.
                                  }
                                } @else {
                                  R.P. < 3 ans (Inadmissible).
                                }
                              </span>
                            </div>
                          </div>

                          <!-- Qualifications detail -->
                          <div class="flex items-start gap-1">
                            <span
                              class="font-bold"
                              [class.text-emerald-600]="s3.isEducationAdmissible"
                              [class.text-rose-600]="!s3.isEducationAdmissible"
                            >
                              {{ s3.isEducationAdmissible ? "✓" : "✗" }}
                            </span>
                            <div>
                              <span class="font-semibold">Scolarité : </span>
                              <span
                                [class.text-rose-700]="!s3.isEducationAdmissible"
                                [class.text-emerald-700]="
                                  s3.isEducationAdmissible
                                "
                              >
                                {{
                                  s3.isEducationAdmissible
                                    ? "Scolarité/expérience rencontrée (OK)."
                                    : "Scolarité/expérience non rencontrée."
                                }}
                              </span>
                            </div>
                          </div>
                        </div>

                        <!-- SIP Status Warning -->
                        @if (s3.isJobClosed) {
                          <div
                            class="mt-2 p-1.5 bg-red-100 text-red-800 rounded border border-red-200 flex items-start gap-1.5 font-semibold text-[10px] leading-tight"
                          >
                            <span>⚠</span>
                            <div>
                              Ce métier est présentement FERMÉ dans le SIP
                              (aucune vacance).
                            </div>
                          </div>
                        }
                      }
                    </div>
                  }
                }
              </div>
            </div>
          </div>

          <!-- Scolarité et Expérience -->
          <div class="flex flex-col xl:flex-row gap-6">
            <!-- Scolarité -->
            <div
              class="bg-white border border-slate-200 rounded-xl shadow-sm flex flex-col flex-1"
            >
              <div class="bg-slate-50 border-b border-slate-200 shrink-0">
                <div class="p-4 pb-0">
                  <h3 class="text-lg font-bold text-slate-800 mb-3">
                    Scolarité
                  </h3>
                  <div class="flex gap-1 overflow-x-auto scolarite-tabs">
                    <button
                      (click)="activeScolariteTab.set('secondaire')"
                      [class.border-blue-600]="
                        activeScolariteTab() === 'secondaire'
                      "
                      [class.text-blue-600]="
                        activeScolariteTab() === 'secondaire'
                      "
                      [class.border-transparent]="
                        activeScolariteTab() !== 'secondaire'
                      "
                      [class.text-slate-500]="
                        activeScolariteTab() !== 'secondaire'
                      "
                      class="px-4 py-2 border-b-2 font-medium text-sm whitespace-nowrap transition-colors hover:text-blue-600 hover:bg-slate-100/50 rounded-t-lg"
                    >
                      Secondaire
                    </button>
                    <button
                      (click)="activeScolariteTab.set('specialises')"
                      [class.border-blue-600]="
                        activeScolariteTab() === 'specialises'
                      "
                      [class.text-blue-600]="
                        activeScolariteTab() === 'specialises'
                      "
                      [class.border-transparent]="
                        activeScolariteTab() !== 'specialises'
                      "
                      [class.text-slate-500]="
                        activeScolariteTab() !== 'specialises'
                      "
                      class="px-4 py-2 border-b-2 font-medium text-sm whitespace-nowrap transition-colors hover:text-blue-600 hover:bg-slate-100/50 rounded-t-lg"
                    >
                      Cours spécialisés
                    </button>
                    <button
                      (click)="activeScolariteTab.set('universitaire')"
                      [class.border-blue-600]="
                        activeScolariteTab() === 'universitaire'
                      "
                      [class.text-blue-600]="
                        activeScolariteTab() === 'universitaire'
                      "
                      [class.border-transparent]="
                        activeScolariteTab() !== 'universitaire'
                      "
                      [class.text-slate-500]="
                        activeScolariteTab() !== 'universitaire'
                      "
                      class="px-4 py-2 border-b-2 font-medium text-sm whitespace-nowrap transition-colors hover:text-blue-600 hover:bg-slate-100/50 rounded-t-lg"
                    >
                      Universitaire
                    </button>
                  </div>
                </div>
              </div>
              <div class="p-4">
                <!-- TAB SECONDAIRE -->
                <div
                  *ngIf="activeScolariteTab() === 'secondaire'"
                  class="flex flex-col gap-2"
                >
                  <!-- Année scolaire -->
                  <div>
                    <h4
                      class="text-sm font-semibold text-slate-500 mb-2 px-3 uppercase tracking-wider"
                    >
                      Année scolaire
                    </h4>
                    <label
                      *ngFor="let crit of criteriaAnneeScolaire()"
                      class="flex items-start gap-3 p-3 hover:bg-slate-50 rounded-lg cursor-pointer transition-colors border border-transparent hover:border-slate-200 group"
                    >
                      <input
                        type="checkbox"
                        [checked]="selectedCriteriaIds().has(crit.id)"
                        (change)="toggleManualCriterion(crit.id)"
                        class="mt-0.5 flex-shrink-0 w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 rounded focus:ring-blue-500"
                      />
                      <span
                        class="text-sm text-slate-700 group-hover:text-slate-900 font-medium"
                        >{{ crit.label }}</span
                      >
                    </label>
                  </div>

                  <!-- Langue -->
                  <div class="mt-2 pt-3 border-t border-slate-100">
                    <h4
                      class="text-sm font-semibold text-slate-500 mb-2 px-3 uppercase tracking-wider"
                    >
                      Langue
                    </h4>
                    <label
                      *ngFor="let crit of criteriaLangue()"
                      class="flex items-start gap-3 p-3 hover:bg-slate-50 rounded-lg cursor-pointer transition-colors border border-transparent hover:border-slate-200 group"
                    >
                      <input
                        type="checkbox"
                        [checked]="selectedCriteriaIds().has(crit.id)"
                        (change)="toggleManualCriterion(crit.id)"
                        class="mt-0.5 flex-shrink-0 w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 rounded focus:ring-blue-500"
                      />
                      <span
                        class="text-sm text-slate-700 group-hover:text-slate-900 font-medium"
                        >{{ crit.label }}</span
                      >
                    </label>
                  </div>

                  <!-- Mathématique -->
                  <div class="mt-2 pt-3 border-t border-slate-100">
                    <div class="flex justify-between items-center mb-2 px-3">
                      <h4
                        class="text-sm font-semibold text-slate-500 uppercase tracking-wider"
                      >
                        Mathématique
                      </h4>
                      <select
                        [(ngModel)]="selectedProvince"
                        class="px-2 py-1 border border-slate-300 bg-white rounded text-xs focus:outline-none focus:ring-2 focus:ring-blue-500 max-w-[150px] truncate cursor-pointer"
                      >
                        <option *ngFor="let p of PROVINCES" [value]="p.id">
                          {{ p.name }}
                        </option>
                      </select>
                    </div>
                    <label
                      *ngFor="let m of mathCoursesForProvince()"
                      class="flex items-start gap-3 p-3 hover:bg-slate-50 rounded-lg cursor-pointer transition-colors border border-transparent hover:border-slate-200 group"
                    >
                      <input
                        type="checkbox"
                        [checked]="selectedCriteriaIds().has(m.id)"
                        (change)="toggleManualCriterion(m.id)"
                        class="mt-0.5 flex-shrink-0 w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 rounded focus:ring-blue-500"
                      />
                      <span
                        class="text-sm text-slate-700 group-hover:text-slate-900 font-medium"
                        >{{ m.label }}</span
                      >
                    </label>
                    <div
                      *ngIf="mathCoursesForProvince().length === 0"
                      class="text-sm text-slate-500 italic p-2"
                    >
                      Aucun cours de mathématiques défini pour cette province.
                    </div>
                  </div>

                  <!-- Science -->
                  <div class="mt-2 pt-3 border-t border-slate-100">
                    <h4
                      class="text-sm font-semibold text-slate-500 mb-2 px-3 uppercase tracking-wider"
                    >
                      Science
                    </h4>
                    <label
                      *ngFor="let crit of criteriaScience()"
                      class="flex items-start gap-3 p-3 hover:bg-slate-50 rounded-lg cursor-pointer transition-colors border border-transparent hover:border-slate-200 group"
                    >
                      <input
                        type="checkbox"
                        [checked]="selectedCriteriaIds().has(crit.id)"
                        (change)="toggleManualCriterion(crit.id)"
                        class="mt-0.5 flex-shrink-0 w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 rounded focus:ring-blue-500"
                      />
                      <span
                        class="text-sm text-slate-700 group-hover:text-slate-900 font-medium"
                        >{{ crit.label }}</span
                      >
                    </label>
                  </div>

                  <!-- Informatique -->
                  <div class="mt-2 pt-3 border-t border-slate-100">
                    <h4
                      class="text-sm font-semibold text-slate-500 mb-2 px-3 uppercase tracking-wider"
                    >
                      Informatique
                    </h4>
                    <label
                      *ngFor="let crit of criteriaInformatique()"
                      class="flex items-start gap-3 p-3 hover:bg-slate-50 rounded-lg cursor-pointer transition-colors border border-transparent hover:border-slate-200 group"
                    >
                      <input
                        type="checkbox"
                        [checked]="selectedCriteriaIds().has(crit.id)"
                        (change)="toggleManualCriterion(crit.id)"
                        class="mt-0.5 flex-shrink-0 w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 rounded focus:ring-blue-500"
                      />
                      <span
                        class="text-sm text-slate-700 group-hover:text-slate-900 font-medium"
                        >{{ crit.label }}</span
                      >
                    </label>
                  </div>
                </div>

                <!-- TAB COURS SPÉCIALISÉS -->
                <div
                  *ngIf="activeScolariteTab() === 'specialises'"
                  class="flex flex-col gap-2"
                >
                  <h4
                    class="text-sm font-semibold text-slate-500 mb-2 px-3 uppercase tracking-wider"
                  >
                    Cours post-secondaire (non universitaire)
                  </h4>
                  <label
                    *ngFor="let crit of criteriaCoursSpecialise()"
                    class="flex items-start gap-3 p-3 hover:bg-slate-50 rounded-lg cursor-pointer transition-colors border border-transparent hover:border-slate-200 group"
                  >
                    <input
                      type="checkbox"
                      [checked]="selectedCriteriaIds().has(crit.id)"
                      (change)="toggleManualCriterion(crit.id)"
                      class="mt-0.5 flex-shrink-0 w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 rounded focus:ring-blue-500"
                    />
                    <span
                      class="text-sm text-slate-700 group-hover:text-slate-900 font-medium"
                      >{{ crit.label }}</span
                    >
                  </label>
                  <div
                    *ngIf="criteriaCoursSpecialise().length === 0"
                    class="text-sm text-slate-500 italic p-2"
                  >
                    Aucun critère défini.
                  </div>
                </div>

                <!-- TAB UNIVERSITAIRE -->
                <div
                  *ngIf="activeScolariteTab() === 'universitaire'"
                  class="flex flex-col gap-2"
                >
                  <!-- Premier cycle -->
                  <div>
                    <label
                      class="flex items-center gap-2 px-3 mb-2 cursor-pointer group"
                    >
                      <input
                        type="checkbox"
                        [checked]="
                          selectedCriteriaIds().has('univ_1er_cycle_global')
                        "
                        (change)="
                          toggleManualCriterion('univ_1er_cycle_global')
                        "
                        class="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 rounded focus:ring-blue-500"
                      />
                      <h4
                        class="text-sm font-semibold text-slate-500 uppercase tracking-wider group-hover:text-slate-700"
                      >
                        Étude de premier cycle
                      </h4>
                    </label>

                    <div class="ml-2 mb-2 border-t border-slate-100 pt-2">
                      <div
                        class="flex items-center gap-1 w-full px-1 py-1 group"
                      >
                        <button
                          (click)="toggleDomaine('genie')"
                          class="focus:outline-none flex-shrink-0"
                        >
                          <svg
                            class="w-4 h-4 text-slate-400 group-hover:text-slate-600 transition-transform"
                            [class.rotate-90]="expandedDomaines().has('genie')"
                            xmlns="http://www.w3.org/2000/svg"
                            viewBox="0 0 24 24"
                            fill="none"
                            stroke="currentColor"
                            stroke-width="2"
                            stroke-linecap="round"
                            stroke-linejoin="round"
                          >
                            <path d="m9 18 6-6-6-6" />
                          </svg>
                        </button>
                        <label
                          class="flex items-center gap-2 cursor-pointer flex-grow"
                        >
                          <input
                            type="checkbox"
                            [checked]="
                              selectedCriteriaIds().has('univ_1er_cycle_genie')
                            "
                            (change)="
                              toggleManualCriterion('univ_1er_cycle_genie')
                            "
                            class="w-3.5 h-3.5 text-blue-600 bg-gray-100 border-gray-300 rounded focus:ring-blue-500"
                          />
                          <h5
                            class="text-xs font-bold text-slate-500 uppercase tracking-wider group-hover:text-slate-700 transition-colors pt-0.5"
                          >
                            Domaine du Génie
                          </h5>
                        </label>
                      </div>
                      <div
                        *ngIf="expandedDomaines().has('genie')"
                        class="mt-1 pl-4"
                      >
                        <label
                          *ngFor="
                            let crit of criteriaUniversitaire1erCycleGenie()
                          "
                          class="flex items-start gap-3 p-1.5 hover:bg-slate-50 rounded-lg cursor-pointer transition-colors border border-transparent hover:border-slate-200 group"
                        >
                          <input
                            type="checkbox"
                            [checked]="selectedCriteriaIds().has(crit.id)"
                            (change)="toggleManualCriterion(crit.id)"
                            class="mt-0.5 flex-shrink-0 w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 rounded focus:ring-blue-500"
                          />
                          <span
                            class="text-sm text-slate-700 group-hover:text-slate-900 font-medium"
                            >{{ crit.label }}</span
                          >
                        </label>
                      </div>
                    </div>

                    <div class="ml-2 mb-2 border-t border-slate-100 pt-2">
                      <div
                        class="flex items-center gap-1 w-full px-1 py-1 group"
                      >
                        <button
                          (click)="toggleDomaine('sciences')"
                          class="focus:outline-none flex-shrink-0"
                        >
                          <svg
                            class="w-4 h-4 text-slate-400 group-hover:text-slate-600 transition-transform"
                            [class.rotate-90]="
                              expandedDomaines().has('sciences')
                            "
                            xmlns="http://www.w3.org/2000/svg"
                            viewBox="0 0 24 24"
                            fill="none"
                            stroke="currentColor"
                            stroke-width="2"
                            stroke-linecap="round"
                            stroke-linejoin="round"
                          >
                            <path d="m9 18 6-6-6-6" />
                          </svg>
                        </button>
                        <label
                          class="flex items-center gap-2 cursor-pointer flex-grow"
                        >
                          <input
                            type="checkbox"
                            [checked]="
                              selectedCriteriaIds().has(
                                'univ_1er_cycle_sciences'
                              )
                            "
                            (change)="
                              toggleManualCriterion('univ_1er_cycle_sciences')
                            "
                            class="w-3.5 h-3.5 text-blue-600 bg-gray-100 border-gray-300 rounded focus:ring-blue-500"
                          />
                          <h5
                            class="text-xs font-bold text-slate-500 uppercase tracking-wider group-hover:text-slate-700 transition-colors pt-0.5"
                          >
                            Domaine des Sciences
                          </h5>
                        </label>
                      </div>
                      <div
                        *ngIf="expandedDomaines().has('sciences')"
                        class="mt-1 pl-4"
                      >
                        <label
                          *ngFor="
                            let crit of criteriaUniversitaire1erCycleSciences()
                          "
                          class="flex items-start gap-3 p-1.5 hover:bg-slate-50 rounded-lg cursor-pointer transition-colors border border-transparent hover:border-slate-200 group"
                        >
                          <input
                            type="checkbox"
                            [checked]="selectedCriteriaIds().has(crit.id)"
                            (change)="toggleManualCriterion(crit.id)"
                            class="mt-0.5 flex-shrink-0 w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 rounded focus:ring-blue-500"
                          />
                          <span
                            class="text-sm text-slate-700 group-hover:text-slate-900 font-medium"
                            >{{ crit.label }}</span
                          >
                        </label>
                      </div>
                    </div>

                    <div class="ml-2 mb-2 border-t border-slate-100 pt-2">
                      <div
                        class="flex items-center gap-1 w-full px-1 py-1 group"
                      >
                        <button
                          (click)="toggleDomaine('arts')"
                          class="focus:outline-none flex-shrink-0"
                        >
                          <svg
                            class="w-4 h-4 text-slate-400 group-hover:text-slate-600 transition-transform"
                            [class.rotate-90]="expandedDomaines().has('arts')"
                            xmlns="http://www.w3.org/2000/svg"
                            viewBox="0 0 24 24"
                            fill="none"
                            stroke="currentColor"
                            stroke-width="2"
                            stroke-linecap="round"
                            stroke-linejoin="round"
                          >
                            <path d="m9 18 6-6-6-6" />
                          </svg>
                        </button>
                        <label
                          class="flex items-center gap-2 cursor-pointer flex-grow"
                        >
                          <input
                            type="checkbox"
                            [checked]="
                              selectedCriteriaIds().has('univ_1er_cycle_arts')
                            "
                            (change)="
                              toggleManualCriterion('univ_1er_cycle_arts')
                            "
                            class="w-3.5 h-3.5 text-blue-600 bg-gray-100 border-gray-300 rounded focus:ring-blue-500"
                          />
                          <h5
                            class="text-xs font-bold text-slate-500 uppercase tracking-wider group-hover:text-slate-700 transition-colors pt-0.5"
                          >
                            Domaine des Arts
                          </h5>
                        </label>
                      </div>
                      <div
                        *ngIf="expandedDomaines().has('arts')"
                        class="mt-1 pl-4"
                      >
                        <label
                          *ngFor="
                            let crit of criteriaUniversitaire1erCycleArts()
                          "
                          class="flex items-start gap-3 p-1.5 hover:bg-slate-50 rounded-lg cursor-pointer transition-colors border border-transparent hover:border-slate-200 group"
                        >
                          <input
                            type="checkbox"
                            [checked]="selectedCriteriaIds().has(crit.id)"
                            (change)="toggleManualCriterion(crit.id)"
                            class="mt-0.5 flex-shrink-0 w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 rounded focus:ring-blue-500"
                          />
                          <span
                            class="text-sm text-slate-700 group-hover:text-slate-900 font-medium"
                            >{{ crit.label }}</span
                          >
                        </label>
                      </div>
                    </div>

                    <div class="ml-2 mb-4 border-t border-slate-100 pt-2">
                      <div
                        class="flex items-center gap-1 w-full px-1 py-1 group"
                      >
                        <button
                          (click)="toggleDomaine('sante')"
                          class="focus:outline-none flex-shrink-0"
                        >
                          <svg
                            class="w-4 h-4 text-slate-400 group-hover:text-slate-600 transition-transform"
                            [class.rotate-90]="expandedDomaines().has('sante')"
                            xmlns="http://www.w3.org/2000/svg"
                            viewBox="0 0 24 24"
                            fill="none"
                            stroke="currentColor"
                            stroke-width="2"
                            stroke-linecap="round"
                            stroke-linejoin="round"
                          >
                            <path d="m9 18 6-6-6-6" />
                          </svg>
                        </button>
                        <label
                          class="flex items-center gap-2 cursor-pointer flex-grow"
                        >
                          <input
                            type="checkbox"
                            [checked]="
                              selectedCriteriaIds().has('univ_1er_cycle_sante')
                            "
                            (change)="
                              toggleManualCriterion('univ_1er_cycle_sante')
                            "
                            class="w-3.5 h-3.5 text-blue-600 bg-gray-100 border-gray-300 rounded focus:ring-blue-500"
                          />
                          <h5
                            class="text-xs font-bold text-slate-500 uppercase tracking-wider group-hover:text-slate-700 transition-colors pt-0.5"
                          >
                            Domaine de la Santé
                          </h5>
                        </label>
                      </div>
                      <div
                        *ngIf="expandedDomaines().has('sante')"
                        class="mt-1 pl-4"
                      >
                        <label
                          *ngFor="
                            let crit of criteriaUniversitaire1erCycleSante()
                          "
                          class="flex items-start gap-3 p-1.5 hover:bg-slate-50 rounded-lg cursor-pointer transition-colors border border-transparent hover:border-slate-200 group"
                        >
                          <input
                            type="checkbox"
                            [checked]="selectedCriteriaIds().has(crit.id)"
                            (change)="toggleManualCriterion(crit.id)"
                            class="mt-0.5 flex-shrink-0 w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 rounded focus:ring-blue-500"
                          />
                          <span
                            class="text-sm text-slate-700 group-hover:text-slate-900 font-medium"
                            >{{ crit.label }}</span
                          >
                        </label>
                      </div>
                    </div>

                    <div
                      *ngIf="criteriaUniversitaire1erCycle().length === 0"
                      class="text-sm text-slate-500 italic p-3 text-center border border-dashed border-slate-200 rounded-lg"
                    >
                      Aucun critère défini pour le moment.
                    </div>
                  </div>

                  <!-- Cycle supérieur -->
                  <div class="mt-4 pt-4 border-t border-slate-100">
                    <label
                      class="flex items-center gap-2 px-3 mb-2 cursor-pointer group"
                    >
                      <input
                        type="checkbox"
                        [checked]="
                          selectedCriteriaIds().has('univ_cycle_sup_global')
                        "
                        (change)="
                          toggleManualCriterion('univ_cycle_sup_global')
                        "
                        class="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 rounded focus:ring-blue-500"
                      />
                      <h4
                        class="text-sm font-semibold text-slate-500 uppercase tracking-wider group-hover:text-slate-700"
                      >
                        Étude de cycles supérieurs
                      </h4>
                    </label>

                    <div class="ml-2 mb-2 border-t border-slate-100 pt-2">
                      <div
                        class="flex items-center gap-1 w-full px-1 py-1 group"
                      >
                        <button
                          (click)="toggleDomaine('maitrise')"
                          class="focus:outline-none flex-shrink-0"
                        >
                          <svg
                            class="w-4 h-4 text-slate-400 group-hover:text-slate-600 transition-transform"
                            [class.rotate-90]="
                              expandedDomaines().has('maitrise')
                            "
                            xmlns="http://www.w3.org/2000/svg"
                            viewBox="0 0 24 24"
                            fill="none"
                            stroke="currentColor"
                            stroke-width="2"
                            stroke-linecap="round"
                            stroke-linejoin="round"
                          >
                            <path d="m9 18 6-6-6-6" />
                          </svg>
                        </button>
                        <label
                          class="flex items-center gap-2 cursor-pointer flex-grow"
                        >
                          <input
                            type="checkbox"
                            [checked]="
                              selectedCriteriaIds().has(
                                'univ_cycle_sup_maitrise'
                              )
                            "
                            (change)="
                              toggleManualCriterion('univ_cycle_sup_maitrise')
                            "
                            class="w-3.5 h-3.5 text-blue-600 bg-gray-100 border-gray-300 rounded focus:ring-blue-500"
                          />
                          <h5
                            class="text-xs font-bold text-slate-500 uppercase tracking-wider group-hover:text-slate-700 transition-colors pt-0.5"
                          >
                            Maîtrise
                          </h5>
                        </label>
                      </div>
                      <div
                        *ngIf="expandedDomaines().has('maitrise')"
                        class="mt-1 pl-4"
                      >
                        <label
                          *ngFor="
                            let crit of criteriaUniversitaireCycleSuperieurMaitrise()
                          "
                          class="flex items-start gap-3 p-1.5 hover:bg-slate-50 rounded-lg cursor-pointer transition-colors border border-transparent hover:border-slate-200 group"
                        >
                          <input
                            type="checkbox"
                            [checked]="selectedCriteriaIds().has(crit.id)"
                            (change)="toggleManualCriterion(crit.id)"
                            class="mt-0.5 flex-shrink-0 w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 rounded focus:ring-blue-500"
                          />
                          <span
                            class="text-sm text-slate-700 group-hover:text-slate-900 font-medium"
                            >{{ crit.label }}</span
                          >
                        </label>
                      </div>
                    </div>

                    <div class="ml-2 mb-4 border-t border-slate-100 pt-2">
                      <div
                        class="flex items-center gap-1 w-full px-1 py-1 group"
                      >
                        <button
                          (click)="toggleDomaine('doctorat')"
                          class="focus:outline-none flex-shrink-0"
                        >
                          <svg
                            class="w-4 h-4 text-slate-400 group-hover:text-slate-600 transition-transform"
                            [class.rotate-90]="
                              expandedDomaines().has('doctorat')
                            "
                            xmlns="http://www.w3.org/2000/svg"
                            viewBox="0 0 24 24"
                            fill="none"
                            stroke="currentColor"
                            stroke-width="2"
                            stroke-linecap="round"
                            stroke-linejoin="round"
                          >
                            <path d="m9 18 6-6-6-6" />
                          </svg>
                        </button>
                        <label
                          class="flex items-center gap-2 cursor-pointer flex-grow"
                        >
                          <input
                            type="checkbox"
                            [checked]="
                              selectedCriteriaIds().has(
                                'univ_cycle_sup_doctorat'
                              )
                            "
                            (change)="
                              toggleManualCriterion('univ_cycle_sup_doctorat')
                            "
                            class="w-3.5 h-3.5 text-blue-600 bg-gray-100 border-gray-300 rounded focus:ring-blue-500"
                          />
                          <h5
                            class="text-xs font-bold text-slate-500 uppercase tracking-wider group-hover:text-slate-700 transition-colors pt-0.5"
                          >
                            Doctorat
                          </h5>
                        </label>
                      </div>
                      <div
                        *ngIf="expandedDomaines().has('doctorat')"
                        class="mt-1 pl-4"
                      >
                        <label
                          *ngFor="
                            let crit of criteriaUniversitaireCycleSuperieurDoctorat()
                          "
                          class="flex items-start gap-3 p-1.5 hover:bg-slate-50 rounded-lg cursor-pointer transition-colors border border-transparent hover:border-slate-200 group"
                        >
                          <input
                            type="checkbox"
                            [checked]="selectedCriteriaIds().has(crit.id)"
                            (change)="toggleManualCriterion(crit.id)"
                            class="mt-0.5 flex-shrink-0 w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 rounded focus:ring-blue-500"
                          />
                          <span
                            class="text-sm text-slate-700 group-hover:text-slate-900 font-medium"
                            >{{ crit.label }}</span
                          >
                        </label>
                      </div>
                    </div>

                    <div
                      *ngIf="criteriaUniversitaireCycleSuperieur().length === 0"
                      class="text-sm text-slate-500 italic p-3 text-center border border-dashed border-slate-200 rounded-lg"
                    >
                      Aucun critère défini pour le moment.
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <!-- Expérience -->
            <div
              class="bg-white border border-slate-200 rounded-xl shadow-sm flex flex-col flex-1"
            >
              <div class="bg-slate-50 border-b border-slate-200 shrink-0">
                <div class="p-4 pb-0">
                  <h3 class="text-lg font-bold text-slate-800 mb-3">
                    Expérience
                  </h3>
                </div>
              </div>
              <div class="p-4">
                <div class="flex flex-col gap-2">
                  <label
                    *ngFor="let crit of criteriaExperience()"
                    class="flex items-start gap-3 p-3 hover:bg-slate-50 rounded-lg cursor-pointer transition-colors border border-transparent hover:border-slate-200 group"
                  >
                    <input
                      type="checkbox"
                      [checked]="selectedCriteriaIds().has(crit.id)"
                      (change)="toggleManualCriterion(crit.id)"
                      class="mt-0.5 flex-shrink-0 w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 rounded focus:ring-blue-500"
                    />
                    <span
                      class="text-sm text-slate-700 group-hover:text-slate-900 font-medium whitespace-pre-line"
                      >{{ crit.label }}</span
                    >
                  </label>
                  <div
                    *ngIf="criteriaExperience().length === 0"
                    class="text-sm text-slate-500 italic p-3 text-center border border-dashed border-slate-200 rounded-lg"
                  >
                    Aucune expérience définie.
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- Colonne de droite: Résultat -->
        <div
          class="flex flex-col lg:w-5/12 lg:sticky lg:top-4 h-fit max-h-[calc(100vh-3rem)] gap-4 overflow-y-auto pr-1"
          *ngIf="eligibleJobs().length > 0"
        >
          <!-- Panneau de la note de registre -->
          <div
            class="bg-white border border-slate-200 rounded-xl shadow-sm flex flex-col overflow-hidden shrink-0"
          >
            <div
              class="p-4 bg-slate-50 border-b border-slate-200 shrink-0 flex items-center justify-between flex-wrap gap-2"
            >
              <div class="flex items-center gap-2">
                <span class="p-1 px-2 rounded bg-amber-50 border border-amber-200 text-amber-700 text-[10px] font-bold font-sans uppercase tracking-wider">
                  Registre
                </span>
                <h3 class="text-sm font-bold text-slate-800">
                  Note du registre / dossier
                </h3>
              </div>

              <div>
                <button
                  (click)="copyNoteRegistry()"
                  class="px-3 py-1.5 text-white rounded-lg transition flex items-center gap-1.5 text-xs font-medium cursor-pointer"
                  [class.bg-emerald-600]="noteCopied()"
                  [class.hover:bg-emerald-700]="noteCopied()"
                  [class.bg-slate-600]="!noteCopied()"
                  [class.hover:bg-slate-700]="!noteCopied()"
                >
                  @if (noteCopied()) {
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      width="14"
                      height="14"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      stroke-width="2"
                      stroke-linecap="round"
                      stroke-linejoin="round"
                      class="animate-bounce"
                    >
                      <polyline points="20 6 9 17 4 12"></polyline>
                    </svg>
                    Note copiée !
                  } @else {
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      width="14"
                      height="14"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      stroke-width="2"
                      stroke-linecap="round"
                      stroke-linejoin="round"
                    >
                      <rect
                        x="9"
                        y="9"
                        width="13"
                        height="13"
                        rx="2"
                        ry="2"
                      ></rect>
                      <path
                        d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"
                      ></path>
                    </svg>
                    Copier la note
                  }
                </button>
              </div>
            </div>
            <div class="p-4 bg-slate-50/30">
              <div class="bg-white border border-slate-200 rounded-lg p-3 text-xs text-slate-700 font-mono select-text leading-relaxed whitespace-pre-wrap break-words">
                {{ generateNoteRegistry() }}
              </div>
            </div>
          </div>

          <!-- Panneau du courriel -->
          <div
            class="bg-white border border-slate-200 rounded-xl shadow-sm flex flex-col overflow-hidden min-h-[300px] max-h-[calc(100vh-20rem)]"
          >
            <div
              class="p-4 bg-slate-50 border-b border-slate-200 shrink-0 flex items-center justify-between flex-wrap gap-2"
            >
              <div class="flex items-center gap-2">
                <h3 class="text-sm font-bold text-slate-800">
                  Courriel de réorientation
                </h3>
                <div class="flex gap-2" *ngIf="eligibleJobs().length > 0">
                  <span
                    class="text-xs font-semibold bg-emerald-100 text-emerald-700 px-2 py-0.5 rounded-full"
                  >
                    {{ eligibleJobs().length }} métier(s)
                  </span>
                </div>
              </div>

              <div class="flex gap-2 w-full sm:w-auto">
                <button
                  (click)="copyBilingualEmail()"
                  [disabled]="eligibleJobs().length === 0"
                  class="flex-1 sm:flex-none justify-center px-3 py-1.5 text-white rounded-lg transition flex items-center gap-1.5 text-xs font-medium disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
                  [class.bg-emerald-600]="copied()"
                  [class.hover:bg-emerald-700]="copied()"
                  [class.bg-blue-600]="!copied()"
                  [class.hover:bg-blue-700]="!copied()"
                >
                  @if (copied()) {
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      width="14"
                      height="14"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      stroke-width="2"
                      stroke-linecap="round"
                      stroke-linejoin="round"
                      class="animate-bounce"
                    >
                      <polyline points="20 6 9 17 4 12"></polyline>
                    </svg>
                    Courriel copié !
                  } @else {
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      width="14"
                      height="14"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      stroke-width="2"
                      stroke-linecap="round"
                      stroke-linejoin="round"
                    >
                      <rect
                        x="9"
                        y="9"
                        width="13"
                        height="13"
                        rx="2"
                        ry="2"
                      ></rect>
                      <path
                        d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"
                      ></path>
                    </svg>
                    Copier le courriel
                  }
                </button>
              </div>
            </div>
            <div class="flex-1 overflow-y-auto p-4 bg-white shrink">
              <div
                class="prose prose-slate prose-sm max-w-none text-xs leading-relaxed"
                [innerHTML]="getReoContentHtmlFr()"
              ></div>
            </div>
          </div>
        </div>
      </div>
    </div>
  `,
})
export class ReorientationComponent {
  jobService = inject(JobDatabaseService);
  sharedState = inject(SharedStateService);

  toggleIncludeReo() {
    this.sharedState.includeLinkedEmail.update((v) => !v);
  }

  age = signal<number | null>(null);
  citizenship = signal<string>("Canadian Citizen");
  selectedProvince = signal<string>("QC");

  readonly PROVINCES = [
    { id: "QC", name: "Québec" },
    { id: "ON", name: "Ontario" },
    { id: "BC", name: "C.-B. / Yukon" },
    { id: "AB", name: "Alberta / T.N.-O. / Nunavut" },
    { id: "NB_FR", name: "Nouveau-Brunswick (Franco)" },
  ];

  readonly MATH_COURSES: Record<
    string,
    { id: string; label: string; grade: number; diff: number }[]
  > = {
    QC: [
      {
        id: "qc_10_gen",
        label: "Math CST IV / 416 (10e Appliquée)",
        grade: 10,
        diff: 2,
      },
      {
        id: "qc_10_app",
        label: "Math TS IV / 426 (10e Avancée)",
        grade: 10,
        diff: 3,
      },
      {
        id: "qc_10_adv",
        label: "Math SN IV / 436 (10e Avancée/Théorique)",
        grade: 10,
        diff: 3,
      },
      {
        id: "qc_11_gen",
        label: "Math CST V / 514 (11e Générale)",
        grade: 11,
        diff: 1,
      },
      {
        id: "qc_11_app",
        label: "Math TS V / 526 (11e Appliquée)",
        grade: 11,
        diff: 3,
      },
      {
        id: "qc_11_adv",
        label: "Math SN V / 536 (11e Avancée/Théorique)",
        grade: 11,
        diff: 3,
      },
    ],
    ON: [
      { id: "on_10_app", label: "MFM2P (10e Appliquée)", grade: 10, diff: 2 },
      { id: "on_10_adv", label: "MPM2D (10e Avancée)", grade: 10, diff: 3 },
      { id: "on_11_gen", label: "MEL3E (11e Générale)", grade: 11, diff: 1 },
      { id: "on_11_app", label: "MBF3C (11e Appliquée)", grade: 11, diff: 2 },
      {
        id: "on_11_adv",
        label: "MCF3M / MCR3U (11e Avancée)",
        grade: 11,
        diff: 3,
      },
      { id: "on_12_gen", label: "MEL4E (12e Générale)", grade: 12, diff: 1 },
      { id: "on_12_app", label: "MAP4C (12e Appliquée)", grade: 12, diff: 2 },
      {
        id: "on_12_adv",
        label: "MCT4C / MDM4U / MCV4U / MHF4U (12e Avancée)",
        grade: 12,
        diff: 3,
      },
    ],
    BC: [
      {
        id: "bc_10_gen",
        label: "Math de base 10 / Milieu de travail 10 (10e Générale)",
        grade: 10,
        diff: 1,
      },
      {
        id: "bc_10_app",
        label: "Applications 10 (10e Appliquée)",
        grade: 10,
        diff: 2,
      },
      {
        id: "bc_10_adv",
        label: "Principes 10 / Fondements et pré-calcul 10 (10e Avancée)",
        grade: 10,
        diff: 3,
      },
      {
        id: "bc_11_gen",
        label: "Math de base 11 / Milieu de travail 11 (11e Générale)",
        grade: 11,
        diff: 1,
      },
      {
        id: "bc_11_app",
        label: "Applications 11 / Fondements 11 (11e Appliquée)",
        grade: 11,
        diff: 2,
      },
      {
        id: "bc_11_adv",
        label: "Principes 11 / Pré-calcul 11 (11e Avancée)",
        grade: 11,
        diff: 3,
      },
      {
        id: "bc_12_gen",
        label: "Fondements 12 / Informatique 12 (12e Générale)",
        grade: 12,
        diff: 1,
      },
      {
        id: "bc_12_app",
        label: "Applications 12 (12e Appliquée)",
        grade: 12,
        diff: 2,
      },
      {
        id: "bc_12_adv",
        label:
          "Principes 12 / Pré-calcul 12 / Calcul infinitésimal (12e Avancée)",
        grade: 12,
        diff: 3,
      },
    ],
    AB: [
      {
        id: "ab_10_gen",
        label: "Math 10-4 (10e Générale)",
        grade: 10,
        diff: 1,
      },
      {
        id: "ab_10_app",
        label: "Math 10-3 (10e Appliquée)",
        grade: 10,
        diff: 2,
      },
      { id: "ab_10_adv", label: "Math 10C (10e Avancée)", grade: 10, diff: 3 },
      {
        id: "ab_11_gen",
        label: "Math 20-4 (11e Générale)",
        grade: 11,
        diff: 1,
      },
      {
        id: "ab_11_app",
        label: "Math 20-3 / 20-2 (11e Appliquée)",
        grade: 11,
        diff: 2,
      },
      { id: "ab_11_adv", label: "Math 20-1 (11e Avancée)", grade: 11, diff: 3 },
      {
        id: "ab_12_app",
        label: "Math 30-3 / 30-2 (12e Appliquée)",
        grade: 12,
        diff: 2,
      },
      {
        id: "ab_12_adv",
        label: "Math 30-1 / Math 31 (12e Avancée)",
        grade: 12,
        diff: 3,
      },
    ],
    NB_FR: [
      { id: "nbfr_10_gen", label: "30231A (10e Générale)", grade: 10, diff: 1 },
      {
        id: "nbfr_10_app",
        label: "30231BC (10e Appliquée)",
        grade: 10,
        diff: 2,
      },
      {
        id: "nbfr_11_gen",
        label: "30311A / 30321A (11e Générale)",
        grade: 11,
        diff: 1,
      },
      {
        id: "nbfr_11_app",
        label: "30311B / 30321B (11e Appliquée)",
        grade: 11,
        diff: 2,
      },
      { id: "nbfr_11_adv", label: "30331C (11e Avancée)", grade: 11, diff: 3 },
      {
        id: "nbfr_12_app",
        label: "30411B (12e Appliquée)",
        grade: 12,
        diff: 2,
      },
      {
        id: "nbfr_12_adv",
        label: "30411C / 30421C / 31411 (12e Avancée)",
        grade: 12,
        diff: 3,
      },
    ],
  };

  mathCoursesForProvince = computed(() => {
    const prov = this.selectedProvince();
    return this.MATH_COURSES[prov] || [];
  });

  manualCriteria: ManualCriterion[] = [
    {
      id: "des_12e_annee",
      label: "DES/12e années complété",
      category: "Année scolaire",
    },
    {
      id: "sec4_24_credits",
      label: "24 crédit de sec 4/10e années complété",
      category: "Année scolaire",
    },
    {
      id: "francais_sec4_10e",
      label: "Français ou Anglais de sec 4/10e année",
      category: "Langue",
    },
    {
      id: "francais_sec5_11e",
      label: "Français ou Anglais de sec 5/11e année",
      category: "Langue",
    },
    {
      id: "sci_tech4_sci10",
      label: "Science et technologie 4e/Science de 10e année",
      category: "Science",
    },
    {
      id: "chimie_sec5_11e",
      label: "Chimie de sec 5/11e année",
      category: "Science",
    },
    {
      id: "physique_sec5_11e",
      label: "Physique de sec 5/11e année",
      category: "Science",
    },
    {
      id: "info_sec5_12e",
      label: "Cours d'informatique de sec 5/12e année",
      category: "Informatique",
    },
    { id: "cs_autre_dep", label: "Autre DEP", category: "Cours spécialisés" },
    { id: "cs_autre_dec", label: "Autre DEC", category: "Cours spécialisés" },
    {
      id: "cs_photo_multimedia",
      label:
        "DEC en photographie, en photojournalisme, multimédia ou conception graphique",
      category: "Cours spécialisés",
    },
    {
      id: "cs_sec_incendie",
      label: "DEP/DEC en Technique de sécurité incendie",
      category: "Cours spécialisés",
    },
    {
      id: "cs_tech_lab_med",
      label:
        "Diplôme dans un programme agréé de Technologie de laboratoire médical (DEC en technologie d'analyses biomédicales)",
      category: "Cours spécialisés",
    },
    {
      id: "cs_tech_radio_med",
      label:
        "Diplôme dans un programme agréé de Technologie radiologique médicale (DEC en technologie de radiodiagnostic)",
      category: "Cours spécialisés",
    },
    {
      id: "cs_tech_ing_biomed",
      label:
        "Diplôme de technologie accrédité en ingénierie biomédicale délivré par un établissement canadien (aucun au Québec)",
      category: "Cours spécialisés",
    },
    {
      id: "cs_tech_policieres",
      label: "Techniques policières",
      category: "Cours spécialisés",
    },
    {
      id: "cs_dep_cuisine",
      label: "DEP en cuisine",
      category: "Cours spécialisés",
    },
    {
      id: "cs_etude_musique",
      label: "Études postsecondaire en musique",
      category: "Cours spécialisés",
    },
    {
      id: "cs_dep_refrigeration",
      label: "DEP en réfrigération",
      category: "Cours spécialisés",
    },
    {
      id: "cs_dep_electricite",
      label: "DEP en électricité",
      category: "Cours spécialisés",
    },
    {
      id: "cs_dep_plomberie_chauffage",
      label: "DEP en plomberie et chauffage",
      category: "Cours spécialisés",
    },
    {
      id: "cs_aec_eaux",
      label: "AEC en traitement des eaux",
      category: "Cours spécialisés",
    },
    {
      id: "cs_dep_charpenterie",
      label: "DEP en charpenterie-menuiserie",
      category: "Cours spécialisés",
    },
    {
      id: "cs_cert_assist_dentaire",
      label:
        "Certificat du Bureau national d'examen d'assistance dentaire (pas possible au Québec)",
      category: "Cours spécialisés",
    },
    {
      id: "cs_dep_arpentage_topo",
      label: "DEP en arpentage et topographie",
      category: "Cours spécialisés",
    },
    {
      id: "cs_dep_sante_infirmiers",
      label: "DEP en Santé, assistance et soins infirmiers",
      category: "Cours spécialisés",
    },
    {
      id: "cs_dip_cyber",
      label:
        "Diplôme d'études postsecondaire dans un domaine associé à la cybersécurité",
      category: "Cours spécialisés",
    },
    {
      id: "cs_dip_genie_sci_app",
      label:
        "Diplôme d’études postsecondaires en génie, en technologie du génie ou en sciences appliquées",
      category: "Cours spécialisés",
    },
    {
      id: "cs_cert_soins_param",
      label:
        "Certificat ou diplôme dans un programme de formation en soins paramédicaux agréé ou équivalent",
      category: "Cours spécialisés",
    },
    // Génie
    {
      id: "bacc_genie_aerospatiale_aeronautique",
      label: "Aérospatiale / Aéronautique",
      category: "Universitaire 1er cycle",
      subCategory: "Génie",
    },
    {
      id: "bacc_genie_architecture_navale",
      label: "Architecture navale",
      category: "Universitaire 1er cycle",
      subCategory: "Génie",
    },
    {
      id: "bacc_genie_tech_fisheries_memorial",
      label:
        "Baccalauréat de technologie (Technique du génie et sciences appliquées) par la «Fisheries and Marine Institute of Memorial University» de Terre-Neuve",
      category: "Universitaire 1er cycle",
      subCategory: "Génie",
    },
    {
      id: "bacc_genie_batiment",
      label: "Bâtiment",
      category: "Universitaire 1er cycle",
      subCategory: "Génie",
    },
    {
      id: "bacc_genie_chimie_chimique",
      label: "Chimie / Chimique",
      category: "Universitaire 1er cycle",
      subCategory: "Génie",
    },
    {
      id: "bacc_genie_civil",
      label: "Civil",
      category: "Universitaire 1er cycle",
      subCategory: "Génie",
    },
    {
      id: "bacc_genie_communications",
      label: "Communications",
      category: "Universitaire 1er cycle",
      subCategory: "Génie",
    },
    {
      id: "bacc_genie_conception_systemes",
      label: "Conception de Systèmes",
      category: "Universitaire 1er cycle",
      subCategory: "Génie",
    },
    {
      id: "bacc_genie_cyber_systemes",
      label: "Cyber systèmes",
      category: "Universitaire 1er cycle",
      subCategory: "Génie",
    },
    {
      id: "bacc_genie_electricite_electrique",
      label: "Électricité / Électrique",
      category: "Universitaire 1er cycle",
      subCategory: "Génie",
    },
    {
      id: "bacc_genie_electromecanique",
      label: "Électromécanique",
      category: "Universitaire 1er cycle",
      subCategory: "Génie",
    },
    {
      id: "bacc_genie_energie",
      label: "Énergie",
      category: "Universitaire 1er cycle",
      subCategory: "Génie",
    },
    {
      id: "bacc_genie_environnemental",
      label: "Environnemental / Environnement",
      category: "Universitaire 1er cycle",
      subCategory: "Génie",
    },
    {
      id: "bacc_genie_fabrication",
      label: "Fabrication",
      category: "Universitaire 1er cycle",
      subCategory: "Génie",
    },
    {
      id: "bacc_genie_systemes_electriques_genie",
      label: "Génie des systèmes électriques",
      category: "Universitaire 1er cycle",
      subCategory: "Génie",
    },
    {
      id: "bacc_genie_systemes_electroniques_genie",
      label: "Génie des systèmes électroniques",
      category: "Universitaire 1er cycle",
      subCategory: "Génie",
    },
    {
      id: "bacc_genie_geologie",
      label: "Géologie",
      category: "Universitaire 1er cycle",
      subCategory: "Génie",
    },
    {
      id: "bacc_genie_geomatique",
      label: "Géomatique",
      category: "Universitaire 1er cycle",
      subCategory: "Génie",
    },
    {
      id: "bacc_genie_gestion",
      label: "Gestion",
      category: "Universitaire 1er cycle",
      subCategory: "Génie",
    },
    {
      id: "bacc_genie_industriel_seul",
      label: "Industriel",
      category: "Universitaire 1er cycle",
      subCategory: "Génie",
    },
    {
      id: "bacc_genie_informatique",
      label: "Informatique",
      category: "Universitaire 1er cycle",
      subCategory: "Génie",
    },
    {
      id: "bacc_genie_ingenierie_gestion",
      label: "Ingénierie et Gestion",
      category: "Universitaire 1er cycle",
      subCategory: "Génie",
    },
    {
      id: "bacc_genie_integration",
      label: "Intégration",
      category: "Universitaire 1er cycle",
      subCategory: "Génie",
    },
    {
      id: "bacc_genie_logiciel",
      label: "Logiciel",
      category: "Universitaire 1er cycle",
      subCategory: "Génie",
    },
    {
      id: "bacc_genie_marine",
      label: "Marine",
      category: "Universitaire 1er cycle",
      subCategory: "Génie",
    },
    {
      id: "bacc_genie_maritime",
      label: "Maritime",
      category: "Universitaire 1er cycle",
      subCategory: "Génie",
    },
    {
      id: "bacc_genie_materiaux",
      label: "Matériaux",
      category: "Universitaire 1er cycle",
      subCategory: "Génie",
    },
    {
      id: "bacc_genie_materiels",
      label: "Matériels",
      category: "Universitaire 1er cycle",
      subCategory: "Génie",
    },
    {
      id: "bacc_genie_mecanique",
      label: "Mécanique",
      category: "Universitaire 1er cycle",
      subCategory: "Génie",
    },
    {
      id: "bacc_genie_mecatronique",
      label: "Mécatronique",
      category: "Universitaire 1er cycle",
      subCategory: "Génie",
    },
    {
      id: "bacc_genie_metallurgique",
      label: "Métallurgique",
      category: "Universitaire 1er cycle",
      subCategory: "Génie",
    },
    {
      id: "bacc_genie_microelectronique",
      label: "Microélectronique",
      category: "Universitaire 1er cycle",
      subCategory: "Génie",
    },
    {
      id: "bacc_genie_minier",
      label: "Minier",
      category: "Universitaire 1er cycle",
      subCategory: "Génie",
    },
    {
      id: "bacc_genie_nanotechnologie",
      label: "Nanotechnologie",
      category: "Universitaire 1er cycle",
      subCategory: "Génie",
    },
    {
      id: "bacc_genie_nucleaire",
      label: "Nucléaire",
      category: "Universitaire 1er cycle",
      subCategory: "Génie",
    },
    {
      id: "bacc_genie_operations_logistique",
      label: "Opérations et Logistique",
      category: "Universitaire 1er cycle",
      subCategory: "Génie",
    },
    {
      id: "bacc_genie_ordinateurs",
      label: "Ordinateurs",
      category: "Universitaire 1er cycle",
      subCategory: "Génie",
    },
    {
      id: "bacc_genie_physique",
      label: "Physique",
      category: "Universitaire 1er cycle",
      subCategory: "Génie",
    },
    {
      id: "bacc_genie_physique_technique",
      label: "Physique technique",
      category: "Universitaire 1er cycle",
      subCategory: "Génie",
    },
    {
      id: "bacc_genie_processus",
      label: "Processus",
      category: "Universitaire 1er cycle",
      subCategory: "Génie",
    },
    {
      id: "bacc_genie_production_automatisee",
      label: "Production Automatisée",
      category: "Universitaire 1er cycle",
      subCategory: "Génie",
    },
    {
      id: "bacc_genie_spatiale",
      label: "Spatiale",
      category: "Universitaire 1er cycle",
      subCategory: "Génie",
    },
    {
      id: "bacc_genie_systemes_ingenierie_informatique",
      label: "Systèmes d’Ingénierie et Informatique",
      category: "Universitaire 1er cycle",
      subCategory: "Génie",
    },
    {
      id: "bacc_genie_systemes_electricite",
      label: "Systèmes Électricité",
      category: "Universitaire 1er cycle",
      subCategory: "Génie",
    },
    {
      id: "bacc_genie_systemes_electromecaniques",
      label: "Systèmes Électromécaniques",
      category: "Universitaire 1er cycle",
      subCategory: "Génie",
    },
    {
      id: "bacc_genie_systemes_electroniques",
      label: "Systèmes Électroniques",
      category: "Universitaire 1er cycle",
      subCategory: "Génie",
    },
    {
      id: "bacc_genie_systemes_industriels",
      label: "Systèmes Industriels",
      category: "Universitaire 1er cycle",
      subCategory: "Génie",
    },
    {
      id: "bacc_genie_systemes_informatique",
      label: "Systèmes Informatique",
      category: "Universitaire 1er cycle",
      subCategory: "Génie",
    },
    {
      id: "bacc_genie_systemes_logiciel",
      label: "Systèmes logiciels",
      category: "Universitaire 1er cycle",
      subCategory: "Génie",
    },
    {
      id: "bacc_genie_systemes_mecanique",
      label: "Systèmes Mécanique",
      category: "Universitaire 1er cycle",
      subCategory: "Génie",
    },
    {
      id: "bacc_genie_systemes_mecatronique",
      label: "Systèmes Mécatronique",
      category: "Universitaire 1er cycle",
      subCategory: "Génie",
    },
    {
      id: "bacc_genie_tech_sci_nautiques_cap_breton",
      label: "technologie –Sciences nautiques de l'Université du Cap-Breton",
      category: "Universitaire 1er cycle",
      subCategory: "Génie",
    },
    {
      id: "bacc_genie_vehicules_automoteurs",
      label: "Véhicules Automoteurs",
      category: "Universitaire 1er cycle",
      subCategory: "Génie",
    },

    // Sciences
    {
      id: "bacc_sci_arpentage",
      label: "Arpentage",
      category: "Universitaire 1er cycle",
      subCategory: "Sciences",
    },
    {
      id: "bacc_sci_bsc_genie_protection_incendie",
      label: "BSc Génie en Protection Incendie",
      category: "Universitaire 1er cycle",
      subCategory: "Sciences",
    },
    {
      id: "bacc_sci_chimie",
      label: "Chimie",
      category: "Universitaire 1er cycle",
      subCategory: "Sciences",
    },
    {
      id: "bacc_sci_donnees",
      label: "Données",
      category: "Universitaire 1er cycle",
      subCategory: "Sciences",
    },
    {
      id: "bacc_sci_environnementales",
      label: "Environnemental / Environnement",
      category: "Universitaire 1er cycle",
      subCategory: "Sciences",
    },
    {
      id: "bacc_sci_geologie",
      label: "Géologie",
      category: "Universitaire 1er cycle",
      subCategory: "Sciences",
    },
    {
      id: "bacc_sci_geomatique",
      label: "Géomatique",
      category: "Universitaire 1er cycle",
      subCategory: "Sciences",
    },
    {
      id: "bacc_sci_gestion_information",
      label: "Gestion de l’information",
      category: "Universitaire 1er cycle",
      subCategory: "Sciences",
    },
    {
      id: "bacc_sci_imagerie",
      label: "Imagerie",
      category: "Universitaire 1er cycle",
      subCategory: "Sciences",
    },
    {
      id: "bacc_sci_informatique_seul",
      label: "Informatique",
      category: "Universitaire 1er cycle",
      subCategory: "Sciences",
    },
    {
      id: "bacc_sci_mathematiques",
      label: "Mathématiques",
      category: "Universitaire 1er cycle",
      subCategory: "Sciences",
    },
    {
      id: "bacc_sci_mathematiques_appliquees",
      label: "Mathématiques appliquées",
      category: "Universitaire 1er cycle",
      subCategory: "Sciences",
    },
    {
      id: "bacc_sci_mathematiques_physique",
      label: "Mathématiques et physique",
      category: "Universitaire 1er cycle",
      subCategory: "Sciences",
    },
    {
      id: "bacc_sci_physique",
      label: "Physique",
      category: "Universitaire 1er cycle",
      subCategory: "Sciences",
    },
    {
      id: "bacc_sci_information",
      label: "Science de l’information",
      category: "Universitaire 1er cycle",
      subCategory: "Sciences",
    },
    {
      id: "bacc_sci_information_informatique",
      label: "Science de l’information en informatique",
      category: "Universitaire 1er cycle",
      subCategory: "Sciences",
    },
    {
      id: "bacc_sci_appliquees_general",
      label: "Sciences Appliquées / Général (75% en math ou en physique)",
      category: "Universitaire 1er cycle",
      subCategory: "Sciences",
    },
    {
      id: "bacc_sci_sciences_de_l_informatique",
      label: "Sciences de l’informatique",
      category: "Universitaire 1er cycle",
      subCategory: "Sciences",
    },
    {
      id: "bacc_sci_terre",
      label: "Sciences de la Terre",
      category: "Universitaire 1er cycle",
      subCategory: "Sciences",
    },
    {
      id: "bacc_sci_espace_seul",
      label: "Spatial / Espace",
      category: "Universitaire 1er cycle",
      subCategory: "Sciences",
    },
    {
      id: "bacc_sci_systemes_information",
      label: "Systèmes d’information",
      category: "Universitaire 1er cycle",
      subCategory: "Sciences",
    },
    {
      id: "bacc_sci_systemes_informatiques",
      label: "Systèmes informatiques",
      category: "Universitaire 1er cycle",
      subCategory: "Sciences",
    },
    {
      id: "bacc_sci_technologie_information",
      label: "Technologie de l’information",
      category: "Universitaire 1er cycle",
      subCategory: "Sciences",
    },
    {
      id: "bacc_sci_technologie_surete_protection_incendie",
      label: "Technologie de Sûreté et Protection Incendie",
      category: "Universitaire 1er cycle",
      subCategory: "Sciences",
    },

    // Arts
    {
      id: "bacc_arts_admin_entreprise",
      label: "Administration d’entreprise",
      category: "Universitaire 1er cycle",
      subCategory: "Arts",
    },
    {
      id: "bacc_arts_admin_affaires",
      label: "Administration des affaires",
      category: "Universitaire 1er cycle",
      subCategory: "Arts",
    },
    {
      id: "bacc_arts_admin_publique",
      label: "Administration publique",
      category: "Universitaire 1er cycle",
      subCategory: "Arts",
    },
    {
      id: "bacc_arts_anglais_francais",
      label: "Anglais ou français",
      category: "Universitaire 1er cycle",
      subCategory: "Arts",
    },
    {
      id: "bacc_arts_anthropologie",
      label: "Anthropologie",
      category: "Universitaire 1er cycle",
      subCategory: "Arts",
    },
    {
      id: "bacc_arts_commercialisation",
      label: "Commercialisation",
      category: "Universitaire 1er cycle",
      subCategory: "Arts",
    },
    {
      id: "bacc_arts_communication_visuelle",
      label: "Communication visuelle",
      category: "Universitaire 1er cycle",
      subCategory: "Arts",
    },
    {
      id: "bacc_arts_communications",
      label: "Communications",
      category: "Universitaire 1er cycle",
      subCategory: "Arts",
    },
    {
      id: "bacc_arts_criminologie",
      label: "Criminologie",
      category: "Universitaire 1er cycle",
      subCategory: "Arts",
    },
    {
      id: "bacc_arts_droit",
      label: "Droit (notamment Droit et Barreau)",
      category: "Universitaire 1er cycle",
      subCategory: "Arts",
    },
    {
      id: "bacc_arts_education",
      label: "Éducation",
      category: "Universitaire 1er cycle",
      subCategory: "Arts",
    },
    {
      id: "bacc_arts_education_adultes",
      label: "Éducation aux adultes",
      category: "Universitaire 1er cycle",
      subCategory: "Arts",
    },
    {
      id: "bacc_arts_education_physique",
      label: "Éducation physique",
      category: "Universitaire 1er cycle",
      subCategory: "Arts",
    },
    {
      id: "bacc_arts_education_professionnelle",
      label: "Éducation professionnelle",
      category: "Universitaire 1er cycle",
      subCategory: "Arts",
    },
    {
      id: "bacc_arts_etudes_internationales_cmr",
      label: "Études internationales au CMR Saint Jean",
      category: "Universitaire 1er cycle",
      subCategory: "Arts",
    },
    {
      id: "bacc_arts_etudes_judiciaires",
      label:
        "Études judiciaires (notamment Droit & justice et Justice humaine)",
      category: "Universitaire 1er cycle",
      subCategory: "Arts",
    },
    {
      id: "bacc_arts_etudes_militaires",
      label: "Études militaires et stratégiques",
      category: "Universitaire 1er cycle",
      subCategory: "Arts",
    },
    {
      id: "bacc_arts_gestion_urgences",
      label: "Gestion des urgences, crises et catastrophes",
      category: "Universitaire 1er cycle",
      subCategory: "Arts",
    },
    {
      id: "bacc_arts_journalisme",
      label: "Journalisme",
      category: "Universitaire 1er cycle",
      subCategory: "Arts",
    },
    {
      id: "bacc_arts_justice_criminelle",
      label: "Justice criminelle",
      category: "Universitaire 1er cycle",
      subCategory: "Arts",
    },
    {
      id: "bacc_arts_linguistique",
      label: "Linguistique",
      category: "Universitaire 1er cycle",
      subCategory: "Arts",
    },
    {
      id: "bacc_arts_medias_numeriques",
      label: "Médias numériques",
      category: "Universitaire 1er cycle",
      subCategory: "Arts",
    },
    {
      id: "bacc_arts_philosophie",
      label: "Philosophie",
      category: "Universitaire 1er cycle",
      subCategory: "Arts",
    },
    {
      id: "bacc_arts_psychologie",
      label: "Psychologie (4 ans)",
      category: "Universitaire 1er cycle",
      subCategory: "Arts",
    },
    {
      id: "bacc_arts_relations_intern",
      label: "Relations internationales",
      category: "Universitaire 1er cycle",
      subCategory: "Arts",
    },
    {
      id: "bacc_arts_relations_publiques",
      label: "Relations publiques",
      category: "Universitaire 1er cycle",
      subCategory: "Arts",
    },
    {
      id: "bacc_arts_ressources_humaines",
      label: "Ressources humaines/gestion des ressources humaines",
      category: "Universitaire 1er cycle",
      subCategory: "Arts",
    },
    {
      id: "bacc_arts_science_politique",
      label: "Science politique",
      category: "Universitaire 1er cycle",
      subCategory: "Arts",
    },
    {
      id: "bacc_arts_sci_policieres",
      label: "Sciences/études policières",
      category: "Universitaire 1er cycle",
      subCategory: "Arts",
    },
    {
      id: "bacc_arts_sec_policieres",
      label: "Sécurité et études policières",
      category: "Universitaire 1er cycle",
      subCategory: "Arts",
    },
    {
      id: "bacc_arts_sec_publique",
      label: "Sécurité publique",
      category: "Universitaire 1er cycle",
      subCategory: "Arts",
    },
    {
      id: "bacc_arts_sociologie",
      label: "Sociologie (4 ans)",
      category: "Universitaire 1er cycle",
      subCategory: "Arts",
    },
    {
      id: "bacc_arts_theologie",
      label: "Théologie",
      category: "Universitaire 1er cycle",
      subCategory: "Arts",
    },

    // Santé
    {
      id: "bacc_sante_adjoint_medecin",
      label: "Adjoint au médecin",
      category: "Universitaire 1er cycle",
      subCategory: "Santé",
    },
    {
      id: "bacc_sante_admin_soins_sante",
      label: "Administration des soins de santé",
      category: "Universitaire 1er cycle",
      subCategory: "Santé",
    },
    {
      id: "bacc_sante_biochimie",
      label: "Biochimie",
      category: "Universitaire 1er cycle",
      subCategory: "Santé",
    },
    {
      id: "bacc_sante_biologie",
      label: "Biologie",
      category: "Universitaire 1er cycle",
      subCategory: "Santé",
    },
    {
      id: "bacc_sante_biologie_humaine",
      label: "Biologie humaine",
      category: "Universitaire 1er cycle",
      subCategory: "Santé",
    },
    {
      id: "bacc_sante_diplome_sciences_vie",
      label: "Diplôme dans une discipline des sciences de la vie",
      category: "Universitaire 1er cycle",
      subCategory: "Santé",
    },
    {
      id: "bacc_sante_genie_biomedical",
      label: "Génie biomédical",
      category: "Universitaire 1er cycle",
      subCategory: "Santé",
    },
    {
      id: "bacc_sante_gestion_services_sante",
      label: "Gestion des services de santé",
      category: "Universitaire 1er cycle",
      subCategory: "Santé",
    },
    {
      id: "bacc_sante_kinesiologie",
      label: "Kinésiologie",
      category: "Universitaire 1er cycle",
      subCategory: "Santé",
    },
    {
      id: "bacc_sante_medecine_dentaire",
      label: "Médecine Dentaire",
      category: "Universitaire 1er cycle",
      subCategory: "Santé",
    },
    {
      id: "bacc_sante_microbiologie",
      label: "Microbiologie",
      category: "Universitaire 1er cycle",
      subCategory: "Santé",
    },
    {
      id: "bacc_sante_pharmacie",
      label: "Pharmacie",
      category: "Universitaire 1er cycle",
      subCategory: "Santé",
    },
    {
      id: "bacc_sante_physiologie_humaine",
      label: "Physiologie humaine",
      category: "Universitaire 1er cycle",
      subCategory: "Santé",
    },
    {
      id: "bacc_sante_physiotherapie",
      label: "Physiothérapie",
      category: "Universitaire 1er cycle",
      subCategory: "Santé",
    },
    {
      id: "bacc_sante_sciences_soins_infirmiers",
      label: "Sciences des soins infirmiers",
      category: "Universitaire 1er cycle",
      subCategory: "Santé",
    },
    {
      id: "bacc_sante_sciences_infirmieres",
      label: "Sciences infirmières",
      category: "Universitaire 1er cycle",
      subCategory: "Santé",
    },

    // Universitaire cycle supérieur
    {
      id: "doctorat_adjoint_medecin",
      label: "Adjoint au médecin",
      category: "Universitaire cycle supérieur",
      subCategory: "Doctorat",
    },
    {
      id: "doctorat_medecine",
      label: "Médecine",
      category: "Universitaire cycle supérieur",
      subCategory: "Doctorat",
    },
    {
      id: "doctorat_sante_pharmacie",
      label: "Pharmacie",
      category: "Universitaire cycle supérieur",
      subCategory: "Doctorat",
    },
    {
      id: "maitrise_adjoint_medecin",
      label: "Adjoint au médecin",
      category: "Universitaire cycle supérieur",
      subCategory: "Maîtrise",
    },
    {
      id: "maitrise_sante_admin_sante",
      label: "Administration de la santé",
      category: "Universitaire cycle supérieur",
      subCategory: "Maîtrise",
    },
    {
      id: "maitrise_admin_affaires",
      label: "Administration des affaires",
      category: "Universitaire cycle supérieur",
      subCategory: "Maîtrise",
    },
    {
      id: "maitrise_sante_admin_soins_sante",
      label: "Administration des soins de santé",
      category: "Universitaire cycle supérieur",
      subCategory: "Maîtrise",
    },
    {
      id: "maitrise_admin_publique",
      label: "Administration publique",
      category: "Universitaire cycle supérieur",
      subCategory: "Maîtrise",
    },
    {
      id: "maitrise_aeronautique",
      label: "Aéronautique",
      category: "Universitaire cycle supérieur",
      subCategory: "Maîtrise",
    },
    {
      id: "maitrise_aerospatial",
      label: "Aérospatial",
      category: "Universitaire cycle supérieur",
      subCategory: "Maîtrise",
    },
    {
      id: "maitrise_alimentation",
      label: "Alimentation",
      category: "Universitaire cycle supérieur",
      subCategory: "Maîtrise",
    },
    {
      id: "maitrise_arts_anglais_francais",
      label: "Anglais ou français",
      category: "Universitaire cycle supérieur",
      subCategory: "Maîtrise",
    },
    {
      id: "maitrise_arts_anthropologie",
      label: "Anthropologie",
      category: "Universitaire cycle supérieur",
      subCategory: "Maîtrise",
    },
    {
      id: "maitrise_arts_anthropologie_sociale",
      label: "Anthropologie sociale",
      category: "Universitaire cycle supérieur",
      subCategory: "Maîtrise",
    },
    {
      id: "maitrise_architecture_navale",
      label: "Architecture navale",
      category: "Universitaire cycle supérieur",
      subCategory: "Maîtrise",
    },
    {
      id: "maitrise_sante_biochimie",
      label: "Biochimie",
      category: "Universitaire cycle supérieur",
      subCategory: "Maîtrise",
    },
    {
      id: "maitrise_sante_biologie",
      label: "Biologie",
      category: "Universitaire cycle supérieur",
      subCategory: "Maîtrise",
    },
    {
      id: "maitrise_sante_biologie_humaine",
      label: "Biologie humaine",
      category: "Universitaire cycle supérieur",
      subCategory: "Maîtrise",
    },
    {
      id: "maitrise_chimie",
      label: "Chimie",
      category: "Universitaire cycle supérieur",
      subCategory: "Maîtrise",
    },
    {
      id: "maitrise_chimique",
      label: "Chimique",
      category: "Universitaire cycle supérieur",
      subCategory: "Maîtrise",
    },
    {
      id: "maitrise_commerce",
      label: "Commerce",
      category: "Universitaire cycle supérieur",
      subCategory: "Maîtrise",
    },
    {
      id: "maitrise_arts_commercialisation",
      label: "Commercialisation",
      category: "Universitaire cycle supérieur",
      subCategory: "Maîtrise",
    },
    {
      id: "maitrise_arts_communications",
      label: "Communications",
      category: "Universitaire cycle supérieur",
      subCategory: "Maîtrise",
    },
    {
      id: "maitrise_comptabilite",
      label: "Comptabilité",
      category: "Universitaire cycle supérieur",
      subCategory: "Maîtrise",
    },
    {
      id: "maitrise_sante_diplome_sciences_vie",
      label: "Diplôme dans une discipline des sciences de la vie",
      category: "Universitaire cycle supérieur",
      subCategory: "Maîtrise",
    },
    {
      id: "maitrise_economie",
      label: "Économie",
      category: "Universitaire cycle supérieur",
      subCategory: "Maîtrise",
    },
    {
      id: "maitrise_arts_education",
      label: "Éducation",
      category: "Universitaire cycle supérieur",
      subCategory: "Maîtrise",
    },
    {
      id: "maitrise_espace",
      label: "Espace",
      category: "Universitaire cycle supérieur",
      subCategory: "Maîtrise",
    },
    {
      id: "maitrise_etudes_internationales",
      label: "Études internationales",
      category: "Universitaire cycle supérieur",
      subCategory: "Maîtrise",
    },
    {
      id: "maitrise_arts_etudes_militaires",
      label: "Études militaires et stratégiques",
      category: "Universitaire cycle supérieur",
      subCategory: "Maîtrise",
    },
    {
      id: "maitrise_finance",
      label: "Finance",
      category: "Universitaire cycle supérieur",
      subCategory: "Maîtrise",
    },
    {
      id: "maitrise_sante_genie_biomedical",
      label: "Génie biomédical",
      category: "Universitaire cycle supérieur",
      subCategory: "Maîtrise",
    },
    {
      id: "maitrise_genie_civil",
      label: "Génie civil",
      category: "Universitaire cycle supérieur",
      subCategory: "Maîtrise",
    },
    {
      id: "maitrise_genie_environnement",
      label: "Génie de l'environnement",
      category: "Universitaire cycle supérieur",
      subCategory: "Maîtrise",
    },
    {
      id: "maitrise_genie_systemes_electriques",
      label: "Génie des systèmes électriques",
      category: "Universitaire cycle supérieur",
      subCategory: "Maîtrise",
    },
    {
      id: "maitrise_genie_systemes_electroniques",
      label: "Génie des systèmes électroniques",
      category: "Universitaire cycle supérieur",
      subCategory: "Maîtrise",
    },
    {
      id: "maitrise_genie_electrique",
      label: "Génie Électrique",
      category: "Universitaire cycle supérieur",
      subCategory: "Maîtrise",
    },
    {
      id: "maitrise_genie_informatique",
      label: "Génie Informatique",
      category: "Universitaire cycle supérieur",
      subCategory: "Maîtrise",
    },
    {
      id: "maitrise_genie_physique",
      label: "Génie Physique",
      category: "Universitaire cycle supérieur",
      subCategory: "Maîtrise",
    },
    {
      id: "maitrise_gestion_chaine_approvisionnement",
      label: "Gestion de chaîne d’approvisionnement",
      category: "Universitaire cycle supérieur",
      subCategory: "Maîtrise",
    },
    {
      id: "maitrise_gestion_entreprise_alimentaire",
      label: "Gestion d’entreprise alimentaire",
      category: "Universitaire cycle supérieur",
      subCategory: "Maîtrise",
    },
    {
      id: "maitrise_gestion_ressources_humaines",
      label: "Gestion de ressources humaines",
      category: "Universitaire cycle supérieur",
      subCategory: "Maîtrise",
    },
    {
      id: "maitrise_sante_gestion_services_sante",
      label: "Gestion des services de santé",
      category: "Universitaire cycle supérieur",
      subCategory: "Maîtrise",
    },
    {
      id: "maitrise_sante_gestion_soins_sante",
      label: "Gestion des soins de santé",
      category: "Universitaire cycle supérieur",
      subCategory: "Maîtrise",
    },
    {
      id: "maitrise_industriel",
      label: "Industriel",
      category: "Universitaire cycle supérieur",
      subCategory: "Maîtrise",
    },
    {
      id: "maitrise_informatiques",
      label: "Informatiques",
      category: "Universitaire cycle supérieur",
      subCategory: "Maîtrise",
    },
    {
      id: "maitrise_sante_integration_systemes_humains",
      label: "Intégration des systèmes humains (facteurs humains)",
      category: "Universitaire cycle supérieur",
      subCategory: "Maîtrise",
    },
    {
      id: "maitrise_arts_journalisme",
      label: "Journalisme",
      category: "Universitaire cycle supérieur",
      subCategory: "Maîtrise",
    },
    {
      id: "maitrise_sante_kinesiologie",
      label: "Kinésiologie",
      category: "Universitaire cycle supérieur",
      subCategory: "Maîtrise",
    },
    {
      id: "maitrise_arts_linguistique",
      label: "Linguistique",
      category: "Universitaire cycle supérieur",
      subCategory: "Maîtrise",
    },
    {
      id: "maitrise_logiciel",
      label: "Logiciel",
      category: "Universitaire cycle supérieur",
      subCategory: "Maîtrise",
    },
    {
      id: "maitrise_logistique",
      label: "Logistique",
      category: "Universitaire cycle supérieur",
      subCategory: "Maîtrise",
    },
    {
      id: "maitrise_sante_physiotherapie",
      label: "Maîtrise en Physiothérapie",
      category: "Universitaire cycle supérieur",
      subCategory: "Maîtrise",
    },
    {
      id: "maitrise_marine",
      label: "Marine",
      category: "Universitaire cycle supérieur",
      subCategory: "Maîtrise",
    },
    {
      id: "maitrise_materiels",
      label: "Matériels",
      category: "Universitaire cycle supérieur",
      subCategory: "Maîtrise",
    },
    {
      id: "maitrise_mathematiques",
      label: "Mathématiques",
      category: "Universitaire cycle supérieur",
      subCategory: "Maîtrise",
    },
    {
      id: "maitrise_mecanique",
      label: "Mécanique",
      category: "Universitaire cycle supérieur",
      subCategory: "Maîtrise",
    },
    {
      id: "maitrise_arts_medias_numeriques",
      label: "Médias numériques",
      category: "Universitaire cycle supérieur",
      subCategory: "Maîtrise",
    },
    {
      id: "maitrise_metallurgique",
      label: "Métallurgique",
      category: "Universitaire cycle supérieur",
      subCategory: "Maîtrise",
    },
    {
      id: "maitrise_sante_microbiologie",
      label: "Microbiologie",
      category: "Universitaire cycle supérieur",
      subCategory: "Maîtrise",
    },
    {
      id: "maitrise_nucleaire",
      label: "Nucléaire",
      category: "Universitaire cycle supérieur",
      subCategory: "Maîtrise",
    },
    {
      id: "maitrise_nutrition_dietetique",
      label: "Nutrition/diététique",
      category: "Universitaire cycle supérieur",
      subCategory: "Maîtrise",
    },
    {
      id: "maitrise_arts_philosophie",
      label: "Philosophie",
      category: "Universitaire cycle supérieur",
      subCategory: "Maîtrise",
    },
    {
      id: "maitrise_sante_physiologie_humaine",
      label: "Physiologie humaine",
      category: "Universitaire cycle supérieur",
      subCategory: "Maîtrise",
    },
    {
      id: "maitrise_physique",
      label: "Physique",
      category: "Universitaire cycle supérieur",
      subCategory: "Maîtrise",
    },
    {
      id: "maitrise_physiques",
      label: "Physiques",
      category: "Universitaire cycle supérieur",
      subCategory: "Maîtrise",
    },
    {
      id: "maitrise_arts_psychologie",
      label: "Psychologie",
      category: "Universitaire cycle supérieur",
      subCategory: "Maîtrise",
    },
    {
      id: "maitrise_arts_psychologie_cognitive",
      label: "Psychologie cognitive",
      category: "Universitaire cycle supérieur",
      subCategory: "Maîtrise",
    },
    {
      id: "maitrise_arts_psychologie_conseil",
      label: "Psychologie de conseil",
      category: "Universitaire cycle supérieur",
      subCategory: "Maîtrise",
    },
    {
      id: "maitrise_arts_psychologie_recherche",
      label: "Psychologie de recherche",
      category: "Universitaire cycle supérieur",
      subCategory: "Maîtrise",
    },
    {
      id: "maitrise_arts_psychologie_industrielle_orga",
      label: "Psychologie industrielle organisationnelle",
      category: "Universitaire cycle supérieur",
      subCategory: "Maîtrise",
    },
    {
      id: "maitrise_arts_psychologie_sociale",
      label: "Psychologie sociale",
      category: "Universitaire cycle supérieur",
      subCategory: "Maîtrise",
    },
    {
      id: "maitrise_arts_psychologie_sociale_applique",
      label: "Psychologie sociale appliqué",
      category: "Universitaire cycle supérieur",
      subCategory: "Maîtrise",
    },
    {
      id: "maitrise_arts_psychologie_sociale_culturale",
      label: "Psychologie sociale/culturale",
      category: "Universitaire cycle supérieur",
      subCategory: "Maîtrise",
    },
    {
      id: "maitrise_relations_industrielles",
      label: "Relations industrielles",
      category: "Universitaire cycle supérieur",
      subCategory: "Maîtrise",
    },
    {
      id: "maitrise_arts_relations_internationales",
      label: "Relations internationales",
      category: "Universitaire cycle supérieur",
      subCategory: "Maîtrise",
    },
    {
      id: "maitrise_arts_relations_publiques",
      label: "Relations publiques",
      category: "Universitaire cycle supérieur",
      subCategory: "Maîtrise",
    },
    {
      id: "maitrise_sante_environnementale_professionnelle",
      label: "Santé environnementale et professionnelle (hygiène du travail)",
      category: "Universitaire cycle supérieur",
      subCategory: "Maîtrise",
    },
    {
      id: "maitrise_sante_publique",
      label: "Santé publique",
      category: "Universitaire cycle supérieur",
      subCategory: "Maîtrise",
    },
    {
      id: "maitrise_arts_science_politique",
      label: "Science politique",
      category: "Universitaire cycle supérieur",
      subCategory: "Maîtrise",
    },
    {
      id: "maitrise_sante_service_social",
      label: "Service Social axé sur la pratique clinique",
      category: "Universitaire cycle supérieur",
      subCategory: "Maîtrise",
    },
    {
      id: "maitrise_arts_sociologie",
      label: "Sociologie",
      category: "Universitaire cycle supérieur",
      subCategory: "Maîtrise",
    },
    {
      id: "maitrise_theologie",
      label: "Théologie",
      category: "Universitaire cycle supérieur",
      subCategory: "Maîtrise",
    },

    // Expérience
    {
      id: "exp_photo_design",
      label:
        "Expérience dans un ou plusieurs des domaines suivants : photographie, photojournalisme, conception graphique ou multimédia",
      category: "Expérience",
    },
    {
      id: "exp_permis_conduire",
      label: "Détenir un permis de conduire provincial/territorial en règle",
      category: "Expérience",
    },
    {
      id: "exp_scslm",
      label:
        "La certification de la Société canadienne de science de laboratoire médical (SCSLM)",
      category: "Expérience",
    },
    {
      id: "exp_acorplm",
      label:
        "La certification de l'alliance canadienne des organismes de réglementation des professionnels de laboratoire médical (ACORPLM), incluant la réussite des examens du «TLM généraliste» pour les technologistes de laboratoire médical (TLM)",
      category: "Expérience",
    },
    {
      id: "exp_permis_reglementation",
      label:
        "Permis ou inscription sans restriction (statut actif) délivré par l’autorité de réglementation provinciale ou territoriale",
      category: "Expérience",
    },
    {
      id: "exp_lettre_conformite",
      label:
        "Lettre de conformité (« Good Standing ») émise par l’autorité de réglementation du candidat",
      category: "Expérience",
    },
    {
      id: "exp_lab_6mois",
      label:
        "Au moins six mois d'expérience à temps plein ou à temps partiel dans un laboratoire médical clinique au cours des deux dernières années",
      category: "Expérience",
    },
    {
      id: "exp_permis_rad",
      label:
        "Détenir un permis, une certification ou autorisation sans restriction d’exercer comme technologue en radiation médicale (en règle et en vigueur) provenant d’un organisme de réglementation provincial/territorial reconnu",
      category: "Expérience",
    },
    {
      id: "exp_association_actrm",
      label:
        "Certification provenant d’un association professionnel ayant conclu une entente réciproque avec l’Association canadienne des technologues en radiation médicale (ACTRM)",
      category: "Expérience",
    },
    {
      id: "exp_lettre_reglementation_en_regle",
      label:
        "Lettre de l'organisme de réglementation de la profession du candidat attestant que ce dernier est « en règle »",
      category: "Expérience",
    },
    {
      id: "exp_tech_eb_6mois",
      label:
        "A travaillé en tant que technologue en électronique biomédicale pendant une période totale d’au moins six (6) mois au cours des deux (2) dernières années",
      category: "Expérience",
    },
    {
      id: "exp_mus_ensembles",
      label:
        "Expérience comme musicien dans une variété d’ensembles et dans divers styles de musique, p. ex. à titre de musicien travaillant à son propre compte, ou à temps plein avec une orchestre, un ensemble ou un groupe de musique local.",
      category: "Expérience",
    },
    {
      id: "exp_mus_etudiant",
      label:
        "Étudiant en voie d’obtenir un diplôme ou un Baccalauréat en interprétation musicale dans un collège, un conservatoire de musique ou une université reconnus",
      category: "Expérience",
    },
    {
      id: "exp_mus_pro",
      label:
        "Expérience comme musicien professionnel dans une variété d’ensembles et dans divers styles de musique, p. ex. à titre de musicien travaillant à son propre compte, ou à temps plein avec une orchestre, un ensemble ou un groupe de musique local",
      category: "Expérience",
    },
    {
      id: "exp_sceau_rouge_cuisine",
      label: "Certificat des normes interprovinciales Sceau rouge",
      category: "Expérience",
    },
    {
      id: "exp_permis_assistant_dentaire",
      label:
        "Permis en règle pour agir en tant qu’assistant dentaire délivré par une autorité de réglementation canadienne provinciale ou territoriale",
      category: "Expérience",
    },
    {
      id: "exp_lettre_dentaire_en_regle",
      label:
        "Lettre de l’autorité de réglementation professionnelle attestant que le candidat est « en règle »",
      category: "Expérience",
    },
    {
      id: "exp_permis_infirmier_auxiliaire",
      label:
        "Détention d’une autorisation en règle de travailler comme infirmier auxiliaire autorisé/immatriculé émise par un organisme de réglementation provincial ou territorial",
      category: "Expérience",
    },
    {
      id: "exp_cert_peroperatoire",
      label:
        "Certification comme infirmier auxiliaire autorisé/immatriculé en soins peropératoires",
      category: "Expérience",
    },
    {
      id: "exp_permis_paramedical",
      label:
        "Inscription actuelle ou en cours au permis ou privilèges hospitaliers de base ou certification en vigueur pour exercer à titre de paramédical(e), délivrés par un organisme de réglementation provincial ou territorial canadien",
      category: "Expérience",
    },
    {
      id: "exp_00189",
      label:
        "Au moins trois mois d'expérience pertinente dans un ou plusieurs des domaines suivants : industrie de la construction, gestion des installations, services d'incendies, services de l'environnement, géomatique, gestion de projet, service militaire",
      category: "Expérience",
    },
    {
      id: "exp_permis_physiotherapie",
      label:
        "Permis/licence d’exercice en règle (à titre actif) en tant que physiothérapeute émis par un organisme de réglementation provincial ou territorial",
      category: "Expérience",
    },
    {
      id: "exp_lettre_physiotherapie_regle",
      label:
        "Lettre de l’organisme de réglementation du candidat attestant que ce dernier est « En règle »",
      category: "Expérience",
    },
    {
      id: "exp_cert_bned",
      label: "Certificat du Bureau national d’examen dentaire du Canada (BNED)",
      category: "Expérience",
    },
    {
      id: "exp_permis_medecine_dentaire",
      label:
        "Autorisation en règle et sans restriction d’exercer la Médecine dentaire de la part d’une autorité réglementaire d’une province/d’un territoire du Canada",
      category: "Expérience",
    },
    {
      id: "exp_lettre_dentiste_regle",
      label:
        "Lettre de l’autorité réglementaire professionnelle attestant que le candidat est en règle",
      category: "Expérience",
    },
    {
      id: "exp_cv_dentiste_5ans",
      label:
        "Curriculum vitae remontant jusqu’à de cinq ans quant à l’expérience en tant que dentiste",
      category: "Expérience",
    },
    {
      id: "exp_permis_pharmacie",
      label: "Permis d’exercice de la pharmacie sans restriction en règle",
      category: "Expérience",
    },
    {
      id: "exp_lettre_pharmacie_regle",
      label:
        "Lettre de l’autorité de réglementation professionnelle attestant que le candidat est « en règle »",
      category: "Expérience",
    },
    {
      id: "exp_permis_soins_infirmiers",
      label:
        "Permis d’exercice en règle (état actif) en soins infirmiers en tant qu’infirmier autorisé ou infirmier en pratique octroyé par un organisme de réglementation provincial ou territorial du Canada",
      category: "Expérience",
    },
    {
      id: "exp_permis_travail_social",
      label:
        "Permis en règle et sans restriction (état actif) d’exercer comme travailleur social, délivré par une autorité / association réglementaire provinciale ou territoriale",
      category: "Expérience",
    },
    {
      id: "exp_lettre_travail_social_regle",
      label:
        "Lettre de l’autorité réglementaire professionnelle attestant que le candidat est « en règle »",
      category: "Expérience",
    },
    {
      id: "exp_00203",
      label:
        "Au moins une (1) année d’expérience cumulative dans deux ou plusieurs des domaines suivants : communications, journalisme, commercialisation, affaires publiques, relations publiques, recherche sur l'opinion publique, médias numériques ou sociaux",
      category: "Expérience",
    },
    {
      id: "exp_permis_droit",
      label:
        "Autorisé à pratiquer le droit dans une province canadienne ou un territoire canadien",
      category: "Expérience",
    },
    {
      id: "exp_lettre_barreau_regle",
      label:
        "Être « membre en règle », en exercice ou non, du Barreau d'une province ou d’un territoire",
      category: "Expérience",
    },
    {
      id: "exp_00208_bacc",
      label:
        "Au moins une ou plusieurs années de travail à temps plein dans un ou plusieurs des domaines suivants : sélection, recrutement (RH), recherche en sciences sociales, orientation scolaire/professionnelle",
      category: "Expérience",
    },
    {
      id: "exp_00211_maitrise",
      label:
        "Au moins trois ans cumulatifs d’expérience à temps plein dans l’un ou plusieurs des domaines suivants : élaboration d’un programme d’études, expert-conseil en éducation, conception de l’instruction, formation du personnel, enseignement/instruction, expert-conseil en instruction, développement de l’instruction",
      category: "Expérience",
    },
    {
      id: "exp_00349_leader_foi",
      label:
        "Accrédité et reconnu comme un leader au sein d’une tradition de foi  par l’autorité de gouvernance de cette même tradition de foi qui exerce une supervision au Canada, et tel que recommandé par le membre désigné du CIAMC",
      category: "Expérience",
    },
    {
      id: "exp_00349_endosse_ciamc",
      label: "Avoir été endossé comme aumônier par le CIAMC",
      category: "Expérience",
    },
    {
      id: "exp_00349_entrevue_aum",
      label:
        "Avoir réussi une entrevue et jugé apte par un comité présidé par le D Svc Aum.  La sélection finale est confirmée par l’Aumônier général.",
      category: "Expérience",
    },
    {
      id: "exp_00374_cert_permis",
      label:
        "Certificat en règle du Conseil de certification des adjoints au médecin du Canada (CCAMC) et permis/licence en règle (en vigueur) d’exercer comme adjoint au médecin délivré(e) par une autorité réglementaire d’une province ou d’un territoire du Canada",
      category: "Expérience",
    },
    {
      id: "exp_00374_lettre_regle",
      label:
        "Lettre de l’autorité professionnelle réglementaire ou de son superviseur en clinique, selon le cas, attestant que le candidat est en règle",
      category: "Expérience",
    },
    {
      id: "exp_00390_residence",
      label: `Achèvement d’une formation spécialisée dans un programme de résidence agréé par le Collège royal des médecins et chirurgiens du Canada dans l’une des spécialités suivantes: 
o Médecine interne avec une résidence de deux ans dans l’une des disciplines suivantes;   
    a) Médecine interne générale 
    b) Maladies infectieuses 
    c) Soins intensifs 
o Anesthésiologie 
o Chirurgie générale 
o Chirurgie orthopédique 
o Psychiatrie 
o Radiologie 
o Médecine physique et de réadaptation (Physiatrie) 
o Médecine d’urgence`,
      category: "Expérience",
    },
    {
      id: "exp_00390_certification",
      label:
        "Certification et titre de fellow du Collège royal des médecins et chirurgiens du Canada, dans l’une des spécialités mentionnées ci dessus",
      category: "Expérience",
    },
    {
      id: "exp_00390_permis",
      label:
        "Permis d’exercice valide et sans restriction pour pratiquer la médecine à titre de spécialiste (selon la spécialité indiquée ci-dessus) dans toute province ou tout territoire du Canada",
      category: "Expérience",
    },
    {
      id: "exp_00390_attestation",
      label:
        "Attestation de bonne conduite professionnelle délivrée par l’organisme de réglementation provincial ou territorial du candidat",
      category: "Expérience",
    },
    {
      id: "exp_00390_civil",
      label:
        "Pour toutes les spécialités : à l’exception de la psychiatrie et de la médecine physique et réadaptation (physiatrie): Être employé à temps plein dans un poste clinique au sein d’un établissement de soins de santé civil",
      category: "Expérience",
    },
    {
      id: "exp_00393_autorisation",
      label:
        "Détenir une Autorisation en règle et sans restriction d’exercer la Médecine en tant que médecin de famille dans une province ou un territoire du Canada",
      category: "Expérience",
    },
    {
      id: "exp_00393_lettre_regle",
      label:
        "Lettre des autorités de réglementation de la province/territoire du candidat attestant que ce dernier est « en règle »",
      category: "Expérience",
    },
    {
      id: "exp_00393_certification",
      label:
        "Certification en médecine familiale du Collège des médecins de famille du Canada",
      category: "Expérience",
    },
    {
      id: "exp_00398_gestion",
      label:
        "Un minimum de deux années d’expérience cumulative en gestion à temps plein au cours des cinq dernières années dans un milieu de soins de santé",
      category: "Expérience",
    },
  ];

  jobRules: JobRule[] = [
    {
      requiredCriteriaIds: ["sec4_24_credits"],
      jobs: ["00005"],
      allowPR: true,
    },
    {
      requiredCriteriaIds: ["sec4_24_credits"],
      jobs: ["00010"],
      allowPR: true,
    },
    {
      requiredCriteriaIds: ["des_12e_annee", "base_math_10_app"],
      jobs: ["00019"],
      allowPR: true,
    },
    {
      jobs: ["00099"],
      allowPR: false, // CC
      customCheck: (selected, coursSpecialisesIds) => {
        const hasDESAndLang =
          selected.has("des_12e_annee") && selected.has("francais_sec5_11e");
        const hasCoursSpecialises = coursSpecialisesIds.some((id) =>
          selected.has(id),
        );
        const has1erCycle =
          selected.has("univ_1er_cycle_global") ||
          Array.from(selected).some((id) => id.startsWith("bacc_"));

        return hasDESAndLang || hasCoursSpecialises || has1erCycle;
      },
    },
    {
      jobs: ["00100"],
      allowPR: true, // RP
      customCheck: (selected) => {
        const hasDES = selected.has("des_12e_annee");
        const hasMath11App = selected.has("base_math_11_app");
        const hasChemOrPhys =
          selected.has("chimie_sec5_11e") || selected.has("physique_sec5_11e");
        return hasDES && hasMath11App && hasChemOrPhys;
      },
    },

    {
      requiredCriteriaIds: ["sec4_24_credits"],
      jobs: ["00105"],
      allowPR: true, // RP
    },
    {
      requiredCriteriaIds: ["sec4_24_credits", "base_math_10_app"],
      jobs: ["00109"],
      allowPR: false, // CC
    },
    {
      requiredCriteriaIds: ["sec4_24_credits"],
      jobs: ["00114"],
      allowPR: false, // CC
    },
    {
      requiredCriteriaIds: ["sec4_24_credits"],
      jobs: ["00115"],
      allowPR: false, // CC
    },
    {
      jobs: ["00120"],
      allowPR: false, // CC
      customCheck: (selected) => {
        const has24PropsAndMath =
          selected.has("sec4_24_credits") && selected.has("base_math_10_app");
        const has1erCycle =
          selected.has("univ_1er_cycle_global") ||
          Array.from(selected).some((id) => id.startsWith("bacc_"));
        return has24PropsAndMath || has1erCycle;
      },
    },
    {
      requiredCriteriaIds: [
        "sec4_24_credits",
        "base_math_10_app",
        "sci_tech4_sci10",
      ],
      jobs: ["00129"],
      allowPR: true, // RP
    },
    {
      requiredCriteriaIds: [
        "sec4_24_credits",
        "base_math_10_app",
        "sci_tech4_sci10",
      ],
      jobs: ["00130", "00134"],
      allowPR: true, // RP
    },
    {
      requiredCriteriaIds: ["sec4_24_credits", "base_math_10_gen"],
      jobs: ["00135"],
      allowPR: true, // RP
    },
    {
      requiredCriteriaIds: ["sec4_24_credits", "base_math_10_app"],
      jobs: ["00136"],
      allowPR: true, // RP
    },
    {
      jobs: ["00137"],
      allowPR: true, // RP
      customCheck: (selected) => {
        return (
          selected.has("des_12e_annee") ||
          selected.has("cs_photo_multimedia") ||
          selected.has("bacc_arts_communications") ||
          selected.has("bacc_arts_communication_visuelle")
        );
      },
    },
    {
      requiredCriteriaIds: ["sec4_24_credits", "base_math_10_gen"],
      jobs: ["00138"],
      allowPR: true, // RP
    },
    {
      jobs: ["00149"],
      allowPR: true, // RP
      customCheck: (selected) => {
        const hasEducation =
          selected.has("des_12e_annee") && selected.has("base_math_10_app");
        const hasFireTech = selected.has("cs_sec_incendie");
        return hasEducation || hasFireTech;
      },
    },
    {
      requiredCriteriaIds: ["cs_tech_lab_med"],
      jobs: ["00152"],
      allowPR: true, // RP
    },
    {
      requiredCriteriaIds: ["cs_tech_radio_med"],
      jobs: ["00153"],
      allowPR: true, // RP
    },
    {
      requiredCriteriaIds: ["cs_tech_ing_biomed"],
      jobs: ["00155"],
      allowPR: true, // RP
    },
    {
      requiredCriteriaIds: ["cs_tech_policieres"],
      jobs: ["00161"],
      allowPR: true, // RP
    },
    {
      jobs: ["00164"],
      allowPR: true, // RP
      customCheck: (selected) => {
        return (
          (selected.has("sec4_24_credits") &&
            selected.has("base_math_11_gen")) ||
          selected.has("cs_dep_cuisine")
        );
      },
    },
    {
      jobs: ["00166"],
      allowPR: true, // RP
      customCheck: (selected) => {
        return (
          selected.has("des_12e_annee") || selected.has("cs_etude_musique")
        );
      },
    },
    {
      requiredCriteriaIds: ["sec4_24_credits"],
      jobs: ["00167", "00168", "00169", "00170", "00171"],
      allowPR: true, // RP
    },
    {
      requiredCriteriaIds: ["des_12e_annee", "base_math_11_app"],
      jobs: ["00238"],
      allowPR: false, // CC
    },
    {
      requiredCriteriaIds: ["sec4_24_credits", "base_math_10_gen"],
      jobs: ["00261"],
      allowPR: true, // RP
    },
    {
      requiredCriteriaIds: ["sec4_24_credits"],
      jobs: ["00299"],
      allowPR: false, // CC
    },
    {
      jobs: ["00301"],
      allowPR: true, // RP
      customCheck: (selected) => {
        return (
          (selected.has("sec4_24_credits") &&
            selected.has("base_math_10_app")) ||
          selected.has("cs_dep_refrigeration")
        );
      },
    },
    {
      jobs: ["00302"],
      allowPR: true, // RP
      customCheck: (selected) => {
        const option1 =
          selected.has("sec4_24_credits") && selected.has("base_math_10_app");
        const option2 = selected.has("cs_dep_electricite");
        const option3 =
          selected.has("des_12e_annee") &&
          selected.has("base_math_11_adv") &&
          selected.has("physique_sec5_11e");
        return option1 || option2 || option3;
      },
    },
    {
      jobs: ["00303"],
      allowPR: true, // RP
      customCheck: (selected) => {
        return (
          (selected.has("sec4_24_credits") &&
            selected.has("base_math_10_app")) ||
          selected.has("cs_dep_electricite")
        );
      },
    },
    {
      jobs: ["00304"],
      allowPR: true, // RP
      customCheck: (selected) => {
        return (
          (selected.has("sec4_24_credits") &&
            selected.has("base_math_10_app")) ||
          selected.has("cs_dep_plomberie_chauffage")
        );
      },
    },
    {
      jobs: ["00305"],
      allowPR: true, // RP
      customCheck: (selected) => {
        return (
          (selected.has("sec4_24_credits") &&
            selected.has("base_math_10_app")) ||
          selected.has("cs_aec_eaux")
        );
      },
    },
    {
      jobs: ["00306"],
      allowPR: true, // RP
      customCheck: (selected) => {
        return (
          (selected.has("sec4_24_credits") &&
            selected.has("base_math_10_app")) ||
          selected.has("cs_dep_charpenterie")
        );
      },
    },
    {
      requiredCriteriaIds: ["sec4_24_credits"],
      jobs: ["00324"],
      allowPR: false, // CC
    },
    {
      requiredCriteriaIds: [
        "sec4_24_credits",
        "base_math_10_app",
        "sci_tech4_sci10",
      ],
      jobs: ["00327"],
      allowPR: true, // RP
    },
    {
      requiredCriteriaIds: ["cs_cert_assist_dentaire"],
      jobs: ["00335"],
      allowPR: true, // RP
    },
    {
      requiredCriteriaIds: ["sec4_24_credits", "base_math_10_app"],
      jobs: ["00337"],
      allowPR: true, // RP
    },
    {
      requiredCriteriaIds: ["sec4_24_credits"],
      jobs: ["00339"],
      allowPR: true, // RP
    },
    {
      requiredCriteriaIds: ["sec4_24_credits", "base_math_10_adv"],
      jobs: ["00366"],
      allowPR: true, // RP
    },
    {
      requiredCriteriaIds: ["sec4_24_credits"],
      jobs: ["00368"],
      allowPR: true,
    },
    {
      jobs: ["00370"],
      allowPR: true,
      customCheck: (selected) => {
        return (
          (selected.has("des_12e_annee") && selected.has("base_math_11_app")) ||
          selected.has("cs_dep_arpentage_topo")
        );
      },
    },
    {
      requiredCriteriaIds: ["cs_dep_sante_infirmiers"],
      jobs: ["00372"],
      allowPR: true,
    },
    {
      requiredCriteriaIds: [
        "sec4_24_credits",
        "base_math_10_app",
        "francais_sec4_10e",
      ],
      jobs: ["00375"],
      allowPR: true,
    },
    {
      requiredCriteriaIds: [
        "sec4_24_credits",
        "base_math_10_app",
        "francais_sec4_10e",
      ],
      jobs: ["00376"],
      allowPR: true,
    },
    {
      jobs: ["00378"],
      allowPR: true,
      customCheck: (selected) => {
        return (
          (selected.has("des_12e_annee") && selected.has("base_math_11_adv")) ||
          (selected.has("des_12e_annee") && selected.has("info_sec5_12e")) ||
          selected.has("cs_dip_cyber")
        );
      },
    },
    {
      requiredCriteriaIds: ["sec4_24_credits", "base_math_10_app"],
      jobs: ["00383"],
      allowPR: true,
    },
    {
      requiredCriteriaIds: ["sec4_24_credits", "base_math_10_app"],
      jobs: ["00384"],
      allowPR: true,
    },
    {
      requiredCriteriaIds: [
        "sec4_24_credits",
        "base_math_10_adv",
        "sci_tech4_sci10",
      ],
      jobs: ["00385"],
      allowPR: true,
    },
    {
      requiredCriteriaIds: ["sec4_24_credits"],
      jobs: ["00386"],
      allowPR: true,
    },
    {
      requiredCriteriaIds: ["sec4_24_credits"],
      jobs: ["00387"],
      allowPR: true,
    },
    {
      requiredCriteriaIds: [
        "sec4_24_credits",
        "base_math_10_adv",
        "sci_tech4_sci10",
      ],
      jobs: ["00394"],
      allowPR: true,
    },
    {
      requiredCriteriaIds: ["sec4_24_credits"],
      jobs: ["00402"],
      allowPR: true,
    },
    {
      requiredCriteriaIds: [
        "sec4_24_credits",
        "base_math_10_app",
        "sci_tech4_sci10",
      ],
      jobs: ["00404"],
      allowPR: true,
    },
    {
      requiredCriteriaIds: [
        "sec4_24_credits",
        "base_math_10_app",
        "sci_tech4_sci10",
      ],
      jobs: ["00405"],
      allowPR: true,
    },
    {
      requiredCriteriaIds: ["cs_cert_soins_param"],
      jobs: ["00406"],
      allowPR: true,
    },
    {
      requiredCriteriaIds: [
        "sec4_24_credits",
        "base_math_10_app",
        "sci_tech4_sci10",
      ],
      jobs: ["00407"],
      allowPR: true,
    },
    {
      jobs: [
        "00178",
        "00179",
        "00180",
        "00182",
        "00183",
        "00184",
        "00328",
        "00389",
      ],
      allowPR: true,
      customCheck: (selected) => {
        const has1erCycle =
          selected.has("univ_1er_cycle_global") ||
          Array.from(selected).some((id) => id.startsWith("bacc_"));
        const hasMaitrise =
          selected.has("univ_cycle_sup_maitrise") ||
          Array.from(selected).some((id) => id.startsWith("maitrise_"));
        return has1erCycle || hasMaitrise;
      },
    },
    {
      jobs: ["00181"],
      allowPR: true,
      customCheck: (selected) => {
        const requiredSciences = [
          "bacc_sci_mathematiques_appliquees",
          "bacc_sci_appliquees_general",
          "bacc_sci_chimie",
          "bacc_sci_systemes_informatiques",
          "bacc_sci_environnementales",
          "bacc_sci_mathematiques",
          "bacc_sci_mathematiques_physique",
          "bacc_sci_physique",
          "bacc_sci_espace_seul",
          "bacc_sci_terre",
        ];
        const requiredGenies = [
          "bacc_genie_civil",
          "bacc_genie_environnemental",
          "bacc_genie_geomatique",
          "bacc_genie_aerospatiale_aeronautique",
          "bacc_genie_chimie_chimique",
          "bacc_genie_informatique",
          "bacc_genie_systemes_informatique",
          "bacc_genie_electricite_electrique",
          "bacc_genie_energie",
          "bacc_genie_physique",
          "bacc_genie_geologie",
          "bacc_genie_industriel_seul",
          "bacc_genie_materiaux",
          "bacc_genie_mecanique",
          "bacc_genie_minier",
          "bacc_genie_batiment",
        ];
        return (
          requiredSciences.some((id) => selected.has(id)) ||
          requiredGenies.some((id) => selected.has(id))
        );
      },
    },
    {
      jobs: ["00185"],
      allowPR: true,
      customCheck: (selected) => {
        const requiredSciences = [
          "bacc_sci_appliquees_general",
          "bacc_sci_sciences_de_l_informatique",
          "bacc_sci_espace_seul",
          "bacc_sci_terre",
          "bacc_sci_physique",
          "bacc_sci_chimie",
        ];
        const requiredGenies = [
          "bacc_genie_aerospatiale_aeronautique",
          "bacc_genie_informatique",
          "bacc_genie_systemes_informatique",
          "bacc_genie_electricite_electrique",
          "bacc_genie_systemes_electricite",
          "bacc_genie_mecanique",
          "bacc_genie_systemes_mecanique",
          "bacc_genie_systemes_mecatronique",
          "bacc_genie_mecatronique",
          "bacc_genie_physique",
          "bacc_genie_logiciel",
          "bacc_genie_systemes_logiciel",
          "bacc_genie_conception_systemes",
          "bacc_genie_chimie_chimique",
          "bacc_genie_gestion",
          "bacc_genie_materiaux",
          "bacc_genie_spatiale",
        ];
        return (
          requiredSciences.some((id) => selected.has(id)) ||
          requiredGenies.some((id) => selected.has(id))
        );
      },
    },
    {
      jobs: ["00187"],
      allowPR: true,
      customCheck: (selected) => {
        const requiredSciences = [
          "bacc_sci_appliquees_general",
          "bacc_sci_chimie",
          "bacc_sci_sciences_de_l_informatique",
          "bacc_sci_systemes_informatiques",
          "bacc_sci_mathematiques",
          "bacc_sci_mathematiques_appliquees",
          "bacc_sci_physique",
          "bacc_sci_espace_seul",
          "bacc_sci_terre",
        ];
        const hasRequiredScience = requiredSciences.some((id) =>
          selected.has(id),
        );
        const hasGenie =
          selected.has("univ_1er_cycle_genie") ||
          Array.from(selected).some((id) => id.startsWith("bacc_genie_"));
        return hasRequiredScience || hasGenie;
      },
    },
    {
      jobs: ["00189"],
      allowPR: true,
      customCheck: (selected) => {
        const requiredSciences1 = [
          "bacc_sci_environnementales",
          "bacc_sci_geologie",
          "bacc_sci_technologie_surete_protection_incendie",
          "bacc_sci_geomatique",
          "bacc_sci_arpentage",
        ];
        const requiredGenies1 = [
          "bacc_genie_chimie_chimique",
          "bacc_genie_gestion",
          "bacc_genie_ingenierie_gestion",
          "bacc_genie_geologie",
        ];
        const cond1 =
          requiredSciences1.some((id) => selected.has(id)) ||
          requiredGenies1.some((id) => selected.has(id));

        const requiredSciences2 = ["bacc_sci_bsc_genie_protection_incendie"];
        const requiredGenies2 = [
          "bacc_genie_civil",
          "bacc_genie_mecanique",
          "bacc_genie_electricite_electrique",
          "bacc_genie_environnemental",
        ];
        const cond2 =
          requiredSciences2.some((id) => selected.has(id)) ||
          requiredGenies2.some((id) => selected.has(id));

        return cond1 || cond2;
      },
    },
    {
      jobs: ["00190"],
      allowPR: true,
      customCheck: (selected) => {
        return (
          selected.has("bacc_sante_physiotherapie") ||
          selected.has("maitrise_sante_physiotherapie")
        );
      },
    },
    {
      jobs: ["00191"],
      allowPR: true,
      customCheck: (selected) => {
        return selected.has("bacc_sante_medecine_dentaire");
      },
    },
    {
      jobs: ["00194"],
      allowPR: true,
      customCheck: (selected) => {
        return (
          selected.has("bacc_sante_pharmacie") ||
          selected.has("doctorat_sante_pharmacie")
        );
      },
    },
    {
      jobs: ["00195"],
      allowPR: true,
      customCheck: (selected) => {
        return (
          selected.has("bacc_sante_sciences_soins_infirmiers") ||
          selected.has("bacc_sante_sciences_infirmieres")
        );
      },
    },
    {
      jobs: ["00197"],
      allowPR: true,
      customCheck: (selected) => {
        const hasBacc =
          selected.has("bacc_sante_biologie_humaine") ||
          selected.has("bacc_sante_physiologie_humaine") ||
          selected.has("bacc_sante_kinesiologie") ||
          selected.has("bacc_sante_biologie") ||
          selected.has("bacc_sante_biochimie") ||
          selected.has("bacc_sante_microbiologie") ||
          selected.has("bacc_sante_genie_biomedical") ||
          selected.has("bacc_sante_diplome_sciences_vie");

        const hasMaitrise =
          selected.has("maitrise_sante_integration_systemes_humains") ||
          selected.has("maitrise_sante_environnementale_professionnelle") ||
          selected.has("maitrise_sante_publique") ||
          selected.has("maitrise_sante_kinesiologie") ||
          selected.has("maitrise_sante_biologie_humaine") ||
          selected.has("maitrise_sante_physiologie_humaine") ||
          selected.has("maitrise_sante_biologie") ||
          selected.has("maitrise_sante_biochimie") ||
          selected.has("maitrise_sante_microbiologie") ||
          selected.has("maitrise_sante_genie_biomedical") ||
          selected.has("maitrise_sante_diplome_sciences_vie");

        return hasBacc || hasMaitrise;
      },
    },
    {
      jobs: ["00198"],
      allowPR: true,
      customCheck: (selected) => {
        return selected.has("maitrise_sante_service_social");
      },
    },
    {
      jobs: ["00203"],
      allowPR: true,
      customCheck: (selected) => {
        return (
          selected.has("bacc_arts_communications") ||
          selected.has("bacc_arts_relations_intern") ||
          selected.has("bacc_arts_journalisme") ||
          selected.has("bacc_arts_relations_publiques") ||
          selected.has("bacc_arts_anglais_francais") ||
          selected.has("bacc_arts_science_politique") ||
          selected.has("bacc_arts_commercialisation") ||
          selected.has("bacc_arts_medias_numeriques") ||
          selected.has("bacc_arts_etudes_militaires") ||
          selected.has("bacc_arts_anthropologie") ||
          selected.has("bacc_arts_psychologie") ||
          selected.has("bacc_arts_philosophie") ||
          selected.has("bacc_arts_sociologie") ||
          selected.has("bacc_arts_linguistique") ||
          selected.has("maitrise_arts_communications") ||
          selected.has("maitrise_arts_relations_internationales") ||
          selected.has("maitrise_arts_journalisme") ||
          selected.has("maitrise_arts_relations_publiques") ||
          selected.has("maitrise_arts_anglais_francais") ||
          selected.has("maitrise_arts_science_politique") ||
          selected.has("maitrise_arts_commercialisation") ||
          selected.has("maitrise_arts_medias_numeriques") ||
          selected.has("maitrise_arts_etudes_militaires") ||
          selected.has("maitrise_arts_anthropologie") ||
          selected.has("maitrise_arts_psychologie") ||
          selected.has("maitrise_arts_philosophie") ||
          selected.has("maitrise_arts_sociologie") ||
          selected.has("maitrise_arts_linguistique")
        );
      },
    },
    {
      jobs: ["00204"],
      allowPR: true,
      customCheck: (selected) => {
        return selected.has("bacc_arts_droit");
      },
    },
    {
      jobs: ["00207", "00213"],
      allowPR: true,
      customCheck: (selected) => {
        return (
          selected.has("univ_1er_cycle_global") ||
          Array.from(selected).some((id) => id.startsWith("bacc_"))
        );
      },
    },
    {
      jobs: ["00208"],
      allowPR: true,
      customCheck: (selected) => {
        return (
          selected.has("bacc_arts_psychologie") ||
          selected.has("bacc_arts_sociologie") ||
          selected.has("maitrise_arts_psychologie_industrielle_orga") ||
          selected.has("maitrise_arts_psychologie_sociale") ||
          selected.has("maitrise_arts_psychologie_cognitive") ||
          selected.has("maitrise_arts_psychologie_recherche") ||
          selected.has("maitrise_arts_psychologie_sociale_applique") ||
          selected.has("maitrise_arts_sociologie") ||
          selected.has("maitrise_arts_anthropologie_sociale") ||
          selected.has("maitrise_arts_psychologie_sociale_culturale") ||
          selected.has("maitrise_arts_psychologie_conseil")
        );
      },
    },
    {
      jobs: ["00211"],
      allowPR: true,
      customCheck: (selected) => {
        return (
          selected.has("bacc_arts_education_professionnelle") ||
          selected.has("bacc_arts_education_adultes") ||
          selected.has("bacc_arts_education_physique") ||
          selected.has("bacc_arts_education") ||
          selected.has("bacc_arts_ressources_humaines") ||
          selected.has("maitrise_arts_education")
        );
      },
    },
    {
      jobs: ["00214"],
      allowPR: true,
      customCheck: (selected) => {
        return (
          selected.has("bacc_arts_justice_criminelle") ||
          selected.has("bacc_arts_criminologie") ||
          selected.has("bacc_arts_gestion_urgences") ||
          selected.has("bacc_arts_etudes_judiciaires") ||
          selected.has("bacc_arts_droit") ||
          selected.has("bacc_arts_sci_policieres") ||
          selected.has("bacc_arts_psychologie") ||
          selected.has("bacc_arts_sociologie") ||
          selected.has("bacc_arts_sec_publique") ||
          selected.has("bacc_arts_sec_policieres") ||
          selected.has("bacc_arts_admin_entreprise") ||
          selected.has("bacc_arts_etudes_militaires") ||
          selected.has("bacc_arts_etudes_internationales_cmr")
        );
      },
    },
    {
      jobs: ["00340"],
      allowPR: true,
      customCheck: (selected) => {
        const requiredSciences = [
          "bacc_sci_mathematiques_appliquees",
          "bacc_sci_mathematiques",
          "bacc_sci_mathematiques_physique",
          "bacc_sci_physique",
          "bacc_sci_chimie",
          "bacc_sci_espace_seul",
          "bacc_sci_terre",
          "bacc_sci_information_informatique",
          "bacc_sci_systemes_informatiques",
          "bacc_sci_gestion_information",
          "bacc_sci_information",
          "bacc_sci_systemes_information",
          "bacc_sci_technologie_information",
        ];
        const hasRequiredScience = requiredSciences.some((id) =>
          selected.has(id),
        );
        const hasGenie =
          selected.has("univ_1er_cycle_genie") ||
          Array.from(selected).some((id) => id.startsWith("bacc_genie_"));
        return hasRequiredScience || hasGenie;
      },
    },
    {
      jobs: ["00341"],
      allowPR: true,
      customCheck: (selected) => {
        const requiredSciences = [
          "bacc_sci_mathematiques_appliquees",
          "bacc_sci_chimie",
          "bacc_sci_imagerie",
          "bacc_sci_mathematiques",
          "bacc_sci_mathematiques_physique",
          "bacc_sci_physique",
          "bacc_sci_espace_seul",
          "bacc_sci_terre",
          "bacc_sci_appliquees_general",
          "bacc_sci_sciences_de_l_informatique",
          "bacc_sci_systemes_informatiques",
          "bacc_sci_gestion_information",
          "bacc_sci_information",
          "bacc_sci_systemes_information",
          "bacc_sci_technologie_information",
        ];
        const hasRequiredScience = requiredSciences.some((id) =>
          selected.has(id),
        );
        const hasGenie =
          selected.has("univ_1er_cycle_genie") ||
          Array.from(selected).some((id) => id.startsWith("bacc_genie_"));
        return hasRequiredScience || hasGenie;
      },
    },
    {
      jobs: ["00344"],
      allowPR: true,
      customCheck: (selected) => {
        const requiredSciences = [
          "bacc_sci_technologie_information",
          "bacc_sci_donnees",
          "bacc_sci_espace_seul",
          "bacc_sci_informatique_seul",
          "bacc_sci_sciences_de_l_informatique",
          "bacc_sci_systemes_informatiques",
          "bacc_sci_mathematiques",
          "bacc_sci_mathematiques_appliquees",
          "bacc_sci_mathematiques_physique",
          "bacc_sci_physique",
        ];
        const hasRequiredScience = requiredSciences.some((id) =>
          selected.has(id),
        );

        const requiredGenieBaccs = [
          "bacc_genie_tech_fisheries_memorial",
          "bacc_genie_aerospatiale_aeronautique",
          "bacc_genie_architecture_navale",
          "bacc_genie_chimie_chimique",
          "bacc_genie_civil",
          "bacc_genie_communications",
          "bacc_genie_industriel_seul",
          "bacc_genie_physique_technique",
          "bacc_genie_systemes_electroniques",
          "bacc_genie_materiaux",
          "bacc_genie_maritime",
          "bacc_genie_mecanique",
          "bacc_genie_metallurgique",
          "bacc_genie_nucleaire",
          "bacc_genie_electricite_electrique",
          "bacc_genie_informatique",
          "bacc_genie_logiciel",
          "bacc_genie_cyber_systemes",
        ];
        const hasRequiredGenieBacc = requiredGenieBaccs.some((id) =>
          selected.has(id),
        );

        const requiredGenieMaitrises = [
          "maitrise_aeronautique",
          "maitrise_aerospatial",
          "maitrise_architecture_navale",
          "maitrise_chimique",
          "maitrise_genie_civil",
          "maitrise_arts_communications",
          "maitrise_industriel",
          "maitrise_genie_physique",
          "maitrise_genie_systemes_electroniques",
          "maitrise_materiels",
          "maitrise_marine",
          "maitrise_mecanique",
          "maitrise_metallurgique",
          "maitrise_nucleaire",
          "maitrise_genie_electrique",
          "maitrise_genie_systemes_electriques",
          "maitrise_genie_informatique",
          "maitrise_informatiques",
          "maitrise_logiciel",
        ];
        const hasRequiredGenieMaitrise = requiredGenieMaitrises.some((id) =>
          selected.has(id),
        );

        return (
          hasRequiredScience || hasRequiredGenieBacc || hasRequiredGenieMaitrise
        );
      },
    },
    {
      jobs: ["00345"],
      allowPR: true,
      customCheck: (selected) => {
        const requiredSciences = [
          "bacc_sci_informatique_seul",
          "bacc_sci_sciences_de_l_informatique",
          "bacc_sci_systemes_informatiques",
          "bacc_sci_mathematiques",
          "bacc_sci_mathematiques_appliquees",
          "bacc_sci_mathematiques_physique",
          "bacc_sci_physique",
          "bacc_sci_espace_seul",
        ];
        const hasRequiredScience = requiredSciences.some((id) =>
          selected.has(id),
        );

        const requiredGenieBaccs = [
          "bacc_genie_aerospatiale_aeronautique",
          "bacc_genie_chimie_chimique",
          "bacc_genie_civil",
          "bacc_genie_environnemental",
          "bacc_genie_systemes_electricite",
          "bacc_genie_systemes_electroniques",
          "bacc_genie_electricite_electrique",
          "bacc_genie_physique",
          "bacc_genie_informatique",
          "bacc_genie_systemes_informatique",
          "bacc_genie_industriel_seul",
          "bacc_genie_logiciel",
          "bacc_genie_materiels",
          "bacc_genie_metallurgique",
          "bacc_genie_nucleaire",
          "bacc_genie_marine",
          "bacc_genie_mecanique",
          "bacc_genie_architecture_navale",
          "bacc_genie_tech_sci_nautiques_cap_breton",
        ];
        const hasRequiredGenieBacc = requiredGenieBaccs.some((id) =>
          selected.has(id),
        );

        const requiredGenieMaitrises = [
          "maitrise_aeronautique",
          "maitrise_aerospatial",
          "maitrise_chimique",
          "maitrise_genie_civil",
          "maitrise_genie_environnement",
          "maitrise_genie_systemes_electriques",
          "maitrise_genie_systemes_electroniques",
          "maitrise_genie_electrique",
          "maitrise_genie_physique",
          "maitrise_physique",
          "maitrise_physiques",
          "maitrise_genie_informatique",
          "maitrise_informatiques",
          "maitrise_industriel",
          "maitrise_logiciel",
          "maitrise_materiels",
          "maitrise_metallurgique",
          "maitrise_nucleaire",
          "maitrise_marine",
          "maitrise_mecanique",
          "maitrise_architecture_navale",
        ];
        const hasRequiredGenieMaitrise = requiredGenieMaitrises.some((id) =>
          selected.has(id),
        );

        return (
          hasRequiredScience || hasRequiredGenieBacc || hasRequiredGenieMaitrise
        );
      },
    },
    {
      jobs: ["00349"],
      allowPR: true,
      customCheck: (selected) => {
        return (
          selected.has("bacc_arts_theologie") ||
          selected.has("maitrise_theologie")
        );
      },
    },
    {
      jobs: ["00374"],
      allowPR: true,
      customCheck: (selected) => {
        return (
          selected.has("bacc_sante_adjoint_medecin") ||
          selected.has("maitrise_adjoint_medecin") ||
          selected.has("doctorat_adjoint_medecin")
        );
      },
    },
    {
      jobs: ["00390"],
      allowPR: true,
      customCheck: (selected) => {
        return selected.has("doctorat_medecine");
      },
    },
    {
      jobs: ["00393"],
      allowPR: true,
      customCheck: (selected) => {
        return selected.has("doctorat_medecine");
      },
    },
    {
      jobs: ["00398"],
      allowPR: true,
      customCheck: (selected) => {
        const option1 =
          selected.has("bacc_sante_gestion_services_sante") ||
          selected.has("bacc_sante_admin_soins_sante");

        const option2 =
          selected.has("bacc_arts_admin_affaires") ||
          selected.has("bacc_arts_admin_publique") ||
          selected.has("bacc_arts_ressources_humaines");

        const option3 =
          selected.has("maitrise_sante_gestion_services_sante") ||
          selected.has("maitrise_sante_admin_soins_sante") ||
          selected.has("maitrise_admin_affaires") ||
          selected.has("maitrise_admin_publique") ||
          selected.has("maitrise_gestion_ressources_humaines");

        const baccSanteSaufPlusHaut = [
          "bacc_sante_adjoint_medecin",
          "bacc_sante_biochimie",
          "bacc_sante_biologie",
          "bacc_sante_biologie_humaine",
          "bacc_sante_diplome_sciences_vie",
          "bacc_sante_genie_biomedical",
          "bacc_sante_kinesiologie",
          "bacc_sante_medecine_dentaire",
          "bacc_sante_microbiologie",
          "bacc_sante_pharmacie",
          "bacc_sante_physiologie_humaine",
          "bacc_sante_physiotherapie",
          "bacc_sante_sciences_soins_infirmiers",
          "bacc_sante_sciences_infirmieres",
        ].some((id) => selected.has(id));

        const dEsSanteSaufPlusHaut = [
          "doctorat_adjoint_medecin",
          "maitrise_adjoint_medecin",
          "doctorat_medecine",
          "doctorat_sante_pharmacie",
          "maitrise_sante_admin_sante",
          "maitrise_sante_biochimie",
          "maitrise_sante_biologie",
          "maitrise_sante_biologie_humaine",
          "maitrise_sante_diplome_sciences_vie",
          "maitrise_sante_genie_biomedical",
          "maitrise_sante_gestion_soins_sante",
          "maitrise_sante_integration_systemes_humains",
          "maitrise_sante_kinesiologie",
          "maitrise_sante_physiotherapie",
          "maitrise_sante_microbiologie",
          "maitrise_sante_physiologie_humaine",
          "maitrise_sante_environnementale_professionnelle",
          "maitrise_sante_publique",
        ].some((id) => selected.has(id));

        const option4 = baccSanteSaufPlusHaut || dEsSanteSaufPlusHaut;

        return option1 || option2 || option3 || option4;
      },
    },
  ];

  selectedCriteriaIds = signal<Set<string>>(new Set<string>());

  activeScolariteTab = signal<"secondaire" | "specialises" | "universitaire">(
    "secondaire",
  );

  criteriaAnneeScolaire = computed(() =>
    this.manualCriteria.filter((c) => c.category === "Année scolaire"),
  );
  criteriaLangue = computed(() =>
    this.manualCriteria.filter((c) => c.category === "Langue"),
  );
  criteriaScience = computed(() =>
    this.manualCriteria.filter((c) => c.category === "Science"),
  );
  criteriaInformatique = computed(() =>
    this.manualCriteria.filter((c) => c.category === "Informatique"),
  );
  criteriaCoursSpecialise = computed(() =>
    this.manualCriteria.filter((c) => c.category === "Cours spécialisés"),
  );
  criteriaUniversitaire1erCycle = computed(() =>
    this.manualCriteria.filter((c) => c.category === "Universitaire 1er cycle"),
  );
  criteriaUniversitaire1erCycleGenie = computed(() =>
    this.manualCriteria.filter(
      (c) =>
        c.category === "Universitaire 1er cycle" && c.subCategory === "Génie",
    ),
  );
  criteriaUniversitaire1erCycleSciences = computed(() =>
    this.manualCriteria.filter(
      (c) =>
        c.category === "Universitaire 1er cycle" &&
        c.subCategory === "Sciences",
    ),
  );
  criteriaUniversitaire1erCycleArts = computed(() =>
    this.manualCriteria.filter(
      (c) =>
        c.category === "Universitaire 1er cycle" && c.subCategory === "Arts",
    ),
  );
  criteriaUniversitaire1erCycleSante = computed(() =>
    this.manualCriteria.filter(
      (c) =>
        c.category === "Universitaire 1er cycle" && c.subCategory === "Santé",
    ),
  );
  criteriaUniversitaireCycleSuperieur = computed(() =>
    this.manualCriteria.filter(
      (c) => c.category === "Universitaire cycle supérieur",
    ),
  );
  criteriaUniversitaireCycleSuperieurMaitrise = computed(() =>
    this.manualCriteria.filter(
      (c) =>
        c.category === "Universitaire cycle supérieur" &&
        c.subCategory === "Maîtrise",
    ),
  );
  criteriaUniversitaireCycleSuperieurDoctorat = computed(() =>
    this.manualCriteria.filter(
      (c) =>
        c.category === "Universitaire cycle supérieur" &&
        c.subCategory === "Doctorat",
    ),
  );
  criteriaExperience = computed(() => {
    const selected = this.selectedCriteriaIds();
    const criteria: ManualCriterion[] = [];

    // Evaluate if user meets base math conditions based on selected province math courses.
    const allMathOptions = Object.values(this.MATH_COURSES).reduce(
      (
        acc: { id: string; label: string; grade: number; diff: number }[],
        courses,
      ) => acc.concat(courses),
      [],
    );
    const selectedMaths = allMathOptions.filter((m) => selected.has(m.id));
    const hasMath = (grade: number, diff: number) => {
      return selectedMaths.some((m) => m.grade >= grade && m.diff >= diff);
    };
    const hasMath10App = hasMath(10, 2);

    // exp_photo_design needs one of: 'des_12e_annee', 'cs_photo_multimedia', 'bacc_arts_communications', 'bacc_arts_communication_visuelle'
    const hasEduForPhoto =
      selected.has("des_12e_annee") ||
      selected.has("cs_photo_multimedia") ||
      selected.has("bacc_arts_communications") ||
      selected.has("bacc_arts_communication_visuelle");
    if (hasEduForPhoto && this.isAdmissibleOtherThanEducation("00137")) {
      const crit = this.manualCriteria.find((c) => c.id === "exp_photo_design");
      if (crit) criteria.push(crit);
    }

    // exp_permis_conduire needs ('des_12e_annee' && 'base_math_10_app') or 'cs_sec_incendie' for 00149, or 'cs_tech_policieres' for 00161, or bacc degrees for 00214
    const check149 =
      ((selected.has("des_12e_annee") && hasMath10App) ||
        selected.has("cs_sec_incendie")) &&
      this.isAdmissibleOtherThanEducation("00149");
    const check161 =
      selected.has("cs_tech_policieres") &&
      this.isAdmissibleOtherThanEducation("00161");
    const hasEducation214 =
      selected.has("bacc_arts_justice_criminelle") ||
      selected.has("bacc_arts_criminologie") ||
      selected.has("bacc_arts_gestion_urgences") ||
      selected.has("bacc_arts_etudes_judiciaires") ||
      selected.has("bacc_arts_droit") ||
      selected.has("bacc_arts_sci_policieres") ||
      selected.has("bacc_arts_psychologie") ||
      selected.has("bacc_arts_sociologie") ||
      selected.has("bacc_arts_sec_publique") ||
      selected.has("bacc_arts_sec_policieres") ||
      selected.has("bacc_arts_admin_entreprise") ||
      selected.has("bacc_arts_etudes_militaires") ||
      selected.has("bacc_arts_etudes_internationales_cmr");
    const check214 =
      hasEducation214 && this.isAdmissibleOtherThanEducation("00214");

    if (check149 || check161 || check214) {
      const crit = this.manualCriteria.find(
        (c) => c.id === "exp_permis_conduire",
      );
      if (crit) criteria.push(crit);
    }

    // exp_scslm, exp_acorplm, exp_permis_reglementation, exp_lettre_conformite, exp_lab_6mois need 'cs_tech_lab_med'
    if (
      selected.has("cs_tech_lab_med") &&
      this.isAdmissibleOtherThanEducation("00152")
    ) {
      const hasScslm = selected.has("exp_scslm");
      const hasAcorplm = selected.has("exp_acorplm");
      if (hasScslm) {
        const crit = this.manualCriteria.find((c) => c.id === "exp_scslm");
        if (crit) criteria.push(crit);
      } else if (hasAcorplm) {
        const crit = this.manualCriteria.find((c) => c.id === "exp_acorplm");
        if (crit) criteria.push(crit);
      } else {
        const critScslm = this.manualCriteria.find((c) => c.id === "exp_scslm");
        const critAcorplm = this.manualCriteria.find(
          (c) => c.id === "exp_acorplm",
        );
        if (critScslm) criteria.push(critScslm);
        if (critAcorplm) criteria.push(critAcorplm);
      }

      const hasPermis = selected.has("exp_permis_reglementation");
      const hasLettre = selected.has("exp_lettre_conformite");
      if (hasPermis) {
        const crit = this.manualCriteria.find(
          (c) => c.id === "exp_permis_reglementation",
        );
        if (crit) criteria.push(crit);
      } else if (hasLettre) {
        const crit = this.manualCriteria.find(
          (c) => c.id === "exp_lettre_conformite",
        );
        if (crit) criteria.push(crit);
      } else {
        const critPermis = this.manualCriteria.find(
          (c) => c.id === "exp_permis_reglementation",
        );
        const critLettre = this.manualCriteria.find(
          (c) => c.id === "exp_lettre_conformite",
        );
        if (critPermis) criteria.push(critPermis);
        if (critLettre) criteria.push(critLettre);
      }

      const critLab6 = this.manualCriteria.find(
        (c) => c.id === "exp_lab_6mois",
      );
      if (critLab6) criteria.push(critLab6);
    }

    // exp_permis_rad, exp_association_actrm, exp_lettre_reglementation_en_regle need 'cs_tech_radio_med'
    if (
      selected.has("cs_tech_radio_med") &&
      this.isAdmissibleOtherThanEducation("00153")
    ) {
      const hasPermisRad = selected.has("exp_permis_rad");
      const hasAssociationActrm = selected.has("exp_association_actrm");
      if (hasPermisRad) {
        const crit = this.manualCriteria.find((c) => c.id === "exp_permis_rad");
        if (crit) criteria.push(crit);
      } else if (hasAssociationActrm) {
        const crit = this.manualCriteria.find(
          (c) => c.id === "exp_association_actrm",
        );
        if (crit) criteria.push(crit);
      } else {
        const critPermisRad = this.manualCriteria.find(
          (c) => c.id === "exp_permis_rad",
        );
        const critAssociationActrm = this.manualCriteria.find(
          (c) => c.id === "exp_association_actrm",
        );
        if (critPermisRad) criteria.push(critPermisRad);
        if (critAssociationActrm) criteria.push(critAssociationActrm);
      }

      const critLettreReg = this.manualCriteria.find(
        (c) => c.id === "exp_lettre_reglementation_en_regle",
      );
      if (critLettreReg) criteria.push(critLettreReg);
    }

    // exp_tech_eb_6mois needs 'cs_tech_ing_biomed'
    if (
      selected.has("cs_tech_ing_biomed") &&
      this.isAdmissibleOtherThanEducation("00155")
    ) {
      const critTechEb6 = this.manualCriteria.find(
        (c) => c.id === "exp_tech_eb_6mois",
      );
      if (critTechEb6) criteria.push(critTechEb6);
    }

    // 00166 musician experience criteria
    if (this.isAdmissibleOtherThanEducation("00166")) {
      if (selected.has("cs_etude_musique")) {
        const critMusPro = this.manualCriteria.find(
          (c) => c.id === "exp_mus_pro",
        );
        if (critMusPro) criteria.push(critMusPro);
      } else if (selected.has("des_12e_annee")) {
        const hasEnsembles = selected.has("exp_mus_ensembles");
        const hasEtudiant = selected.has("exp_mus_etudiant");
        if (hasEnsembles) {
          const crit = this.manualCriteria.find(
            (c) => c.id === "exp_mus_ensembles",
          );
          if (crit) criteria.push(crit);
        } else if (hasEtudiant) {
          const crit = this.manualCriteria.find(
            (c) => c.id === "exp_mus_etudiant",
          );
          if (crit) criteria.push(crit);
        } else {
          const critEnsembles = this.manualCriteria.find(
            (c) => c.id === "exp_mus_ensembles",
          );
          const critEtudiant = this.manualCriteria.find(
            (c) => c.id === "exp_mus_etudiant",
          );
          if (critEnsembles) criteria.push(critEnsembles);
          if (critEtudiant) criteria.push(critEtudiant);
        }
      }
    }

    // 00164 cook experience criteria
    if (
      selected.has("cs_dep_cuisine") &&
      this.isAdmissibleOtherThanEducation("00164")
    ) {
      const critSceauRouge = this.manualCriteria.find(
        (c) => c.id === "exp_sceau_rouge_cuisine",
      );
      if (critSceauRouge) criteria.push(critSceauRouge);
    }

    // 00335 dental assistant experience criteria
    if (
      selected.has("cs_cert_assist_dentaire") &&
      this.isAdmissibleOtherThanEducation("00335")
    ) {
      const critPermisDentaire = this.manualCriteria.find(
        (c) => c.id === "exp_permis_assistant_dentaire",
      );
      const critLettreDentaire = this.manualCriteria.find(
        (c) => c.id === "exp_lettre_dentaire_en_regle",
      );
      if (critPermisDentaire) criteria.push(critPermisDentaire);
      if (critLettreDentaire) criteria.push(critLettreDentaire);
    }

    // 00372 practical nurse experience criteria
    if (
      selected.has("cs_dep_sante_infirmiers") &&
      this.isAdmissibleOtherThanEducation("00372")
    ) {
      const critPermisInfirmier = this.manualCriteria.find(
        (c) => c.id === "exp_permis_infirmier_auxiliaire",
      );
      const critLettreReglementation = this.manualCriteria.find(
        (c) => c.id === "exp_lettre_reglementation_en_regle",
      );
      const critCertPeroperatoire = this.manualCriteria.find(
        (c) => c.id === "exp_cert_peroperatoire",
      );
      if (critPermisInfirmier) criteria.push(critPermisInfirmier);
      if (critLettreReglementation) criteria.push(critLettreReglementation);
      if (critCertPeroperatoire) criteria.push(critCertPeroperatoire);
    }

    // 00406 paramedic experience criteria
    if (
      selected.has("cs_cert_soins_param") &&
      this.isAdmissibleOtherThanEducation("00406")
    ) {
      const critPermisParamed = this.manualCriteria.find(
        (c) => c.id === "exp_permis_paramedical",
      );
      if (critPermisParamed) criteria.push(critPermisParamed);
    }

    // 00189 experience criteria
    const has00189Base =
      selected.has("bacc_sci_environnementales") ||
      selected.has("bacc_sci_geologie") ||
      selected.has("bacc_sci_technologie_surete_protection_incendie") ||
      selected.has("bacc_sci_geomatique") ||
      selected.has("bacc_sci_arpentage") ||
      selected.has("bacc_genie_chimie_chimique") ||
      selected.has("bacc_genie_gestion") ||
      selected.has("bacc_genie_ingenierie_gestion") ||
      selected.has("bacc_genie_geologie");
    if (has00189Base && this.isAdmissibleOtherThanEducation("00189")) {
      const crit00189 = this.manualCriteria.find((c) => c.id === "exp_00189");
      if (crit00189) criteria.push(crit00189);
    }

    // 00190 experience criteria
    if (
      (selected.has("bacc_sante_physiotherapie") ||
        selected.has("maitrise_sante_physiotherapie")) &&
      this.isAdmissibleOtherThanEducation("00190")
    ) {
      const critPermisPhysio = this.manualCriteria.find(
        (c) => c.id === "exp_permis_physiotherapie",
      );
      const critLettrePhysio = this.manualCriteria.find(
        (c) => c.id === "exp_lettre_physiotherapie_regle",
      );
      if (critPermisPhysio) criteria.push(critPermisPhysio);
      if (critLettrePhysio) criteria.push(critLettrePhysio);
    }

    // 00191 experience criteria
    if (
      selected.has("bacc_sante_medecine_dentaire") &&
      this.isAdmissibleOtherThanEducation("00191")
    ) {
      const critBned = this.manualCriteria.find(
        (c) => c.id === "exp_cert_bned",
      );
      const critPermisDentaire = this.manualCriteria.find(
        (c) => c.id === "exp_permis_medecine_dentaire",
      );
      const critLettreDentiste = this.manualCriteria.find(
        (c) => c.id === "exp_lettre_dentiste_regle",
      );
      const critCvDentiste = this.manualCriteria.find(
        (c) => c.id === "exp_cv_dentiste_5ans",
      );
      if (critBned) criteria.push(critBned);
      if (critPermisDentaire) criteria.push(critPermisDentaire);
      if (critLettreDentiste) criteria.push(critLettreDentiste);
      if (critCvDentiste) criteria.push(critCvDentiste);
    }

    // 00194 experience criteria
    if (
      (selected.has("bacc_sante_pharmacie") ||
        selected.has("doctorat_sante_pharmacie")) &&
      this.isAdmissibleOtherThanEducation("00194")
    ) {
      const critPermisPharmacie = this.manualCriteria.find(
        (c) => c.id === "exp_permis_pharmacie",
      );
      const critLettrePharmacie = this.manualCriteria.find(
        (c) => c.id === "exp_lettre_pharmacie_regle",
      );
      if (critPermisPharmacie) criteria.push(critPermisPharmacie);
      if (critLettrePharmacie) criteria.push(critLettrePharmacie);
    }

    // 00195 experience criteria
    if (
      (selected.has("bacc_sante_sciences_soins_infirmiers") ||
        selected.has("bacc_sante_sciences_infirmieres")) &&
      this.isAdmissibleOtherThanEducation("00195")
    ) {
      const critPermisInfirmiers = this.manualCriteria.find(
        (c) => c.id === "exp_permis_soins_infirmiers",
      );
      if (critPermisInfirmiers) criteria.push(critPermisInfirmiers);
    }

    // 00198 experience criteria
    if (
      selected.has("maitrise_sante_service_social") &&
      this.isAdmissibleOtherThanEducation("00198")
    ) {
      const critPermisSocial = this.manualCriteria.find(
        (c) => c.id === "exp_permis_travail_social",
      );
      const critLettreSocial = this.manualCriteria.find(
        (c) => c.id === "exp_lettre_travail_social_regle",
      );
      if (critPermisSocial) criteria.push(critPermisSocial);
      if (critLettreSocial) criteria.push(critLettreSocial);
    }

    // 00203 experience criteria
    if (
      (selected.has("bacc_arts_communications") ||
        selected.has("bacc_arts_relations_intern") ||
        selected.has("bacc_arts_journalisme") ||
        selected.has("bacc_arts_relations_publiques") ||
        selected.has("bacc_arts_anglais_francais") ||
        selected.has("bacc_arts_science_politique") ||
        selected.has("bacc_arts_commercialisation") ||
        selected.has("bacc_arts_medias_numeriques") ||
        selected.has("bacc_arts_etudes_militaires") ||
        selected.has("bacc_arts_anthropologie") ||
        selected.has("bacc_arts_psychologie") ||
        selected.has("bacc_arts_philosophie") ||
        selected.has("bacc_arts_sociologie") ||
        selected.has("bacc_arts_linguistique") ||
        selected.has("maitrise_arts_communications") ||
        selected.has("maitrise_arts_relations_internationales") ||
        selected.has("maitrise_arts_journalisme") ||
        selected.has("maitrise_arts_relations_publiques") ||
        selected.has("maitrise_arts_anglais_francais") ||
        selected.has("maitrise_arts_science_politique") ||
        selected.has("maitrise_arts_commercialisation") ||
        selected.has("maitrise_arts_medias_numeriques") ||
        selected.has("maitrise_arts_etudes_militaires") ||
        selected.has("maitrise_arts_anthropologie") ||
        selected.has("maitrise_arts_psychologie") ||
        selected.has("maitrise_arts_philosophie") ||
        selected.has("maitrise_arts_sociologie") ||
        selected.has("maitrise_arts_linguistique")) &&
      this.isAdmissibleOtherThanEducation("00203")
    ) {
      const crit00203 = this.manualCriteria.find((c) => c.id === "exp_00203");
      if (crit00203) criteria.push(crit00203);
    }

    // 00204 experience criteria
    if (
      selected.has("bacc_arts_droit") &&
      this.isAdmissibleOtherThanEducation("00204")
    ) {
      const critPermisDroit = this.manualCriteria.find(
        (c) => c.id === "exp_permis_droit",
      );
      const critLettreBarreau = this.manualCriteria.find(
        (c) => c.id === "exp_lettre_barreau_regle",
      );
      if (critPermisDroit) criteria.push(critPermisDroit);
      if (critLettreBarreau) criteria.push(critLettreBarreau);
    }

    // 00208 experience criteria (only for baccalaureate degrees)
    if (
      (selected.has("bacc_arts_psychologie") ||
        selected.has("bacc_arts_sociologie")) &&
      this.isAdmissibleOtherThanEducation("00208")
    ) {
      const crit00208 = this.manualCriteria.find(
        (c) => c.id === "exp_00208_bacc",
      );
      if (crit00208) criteria.push(crit00208);
    }

    // 00211 experience criteria (only for master's degree)
    if (
      selected.has("maitrise_arts_education") &&
      this.isAdmissibleOtherThanEducation("00211")
    ) {
      const crit00211 = this.manualCriteria.find(
        (c) => c.id === "exp_00211_maitrise",
      );
      if (crit00211) criteria.push(crit00211);
    }

    // 00349 experience criteria
    if (
      (selected.has("bacc_arts_theologie") ||
        selected.has("maitrise_theologie")) &&
      this.isAdmissibleOtherThanEducation("00349")
    ) {
      const critLeader = this.manualCriteria.find(
        (c) => c.id === "exp_00349_leader_foi",
      );
      const critEndosse = this.manualCriteria.find(
        (c) => c.id === "exp_00349_endosse_ciamc",
      );
      const critEntrevue = this.manualCriteria.find(
        (c) => c.id === "exp_00349_entrevue_aum",
      );
      if (critLeader) criteria.push(critLeader);
      if (critEndosse) criteria.push(critEndosse);
      if (critEntrevue) criteria.push(critEntrevue);
    }

    // 00374 experience criteria
    if (
      (selected.has("bacc_sante_adjoint_medecin") ||
        selected.has("maitrise_adjoint_medecin") ||
        selected.has("doctorat_adjoint_medecin")) &&
      this.isAdmissibleOtherThanEducation("00374")
    ) {
      const critCertPermis = this.manualCriteria.find(
        (c) => c.id === "exp_00374_cert_permis",
      );
      const critLettreRegle = this.manualCriteria.find(
        (c) => c.id === "exp_00374_lettre_regle",
      );
      if (critCertPermis) criteria.push(critCertPermis);
      if (critLettreRegle) criteria.push(critLettreRegle);
    }

    // 00390 experience criteria
    if (selected.has("doctorat_medecine")) {
      if (this.isAdmissibleOtherThanEducation("00390")) {
        const critResidence = this.manualCriteria.find(
          (c) => c.id === "exp_00390_residence",
        );
        const critCert = this.manualCriteria.find(
          (c) => c.id === "exp_00390_certification",
        );
        const critPermis = this.manualCriteria.find(
          (c) => c.id === "exp_00390_permis",
        );
        const critAtte = this.manualCriteria.find(
          (c) => c.id === "exp_00390_attestation",
        );
        const critCivil = this.manualCriteria.find(
          (c) => c.id === "exp_00390_civil",
        );
        if (critResidence) criteria.push(critResidence);
        if (critCert) criteria.push(critCert);
        if (critPermis) criteria.push(critPermis);
        if (critAtte) criteria.push(critAtte);
        if (critCivil) criteria.push(critCivil);
      }

      // 00393 experience criteria (Médecin de famille)
      if (this.isAdmissibleOtherThanEducation("00393")) {
        const critAuto393 = this.manualCriteria.find(
          (c) => c.id === "exp_00393_autorisation",
        );
        const critLettre393 = this.manualCriteria.find(
          (c) => c.id === "exp_00393_lettre_regle",
        );
        const critCert393 = this.manualCriteria.find(
          (c) => c.id === "exp_00393_certification",
        );
        if (critAuto393) criteria.push(critAuto393);
        if (critLettre393) criteria.push(critLettre393);
        if (critCert393) criteria.push(critCert393);
      }
    }

    // 00398 experience criteria
    const baccSanteSaufPlusHaut = [
      "bacc_sante_adjoint_medecin",
      "bacc_sante_biochimie",
      "bacc_sante_biologie",
      "bacc_sante_biologie_humaine",
      "bacc_sante_diplome_sciences_vie",
      "bacc_sante_genie_biomedical",
      "bacc_sante_kinesiologie",
      "bacc_sante_medecine_dentaire",
      "bacc_sante_microbiologie",
      "bacc_sante_pharmacie",
      "bacc_sante_physiologie_humaine",
      "bacc_sante_physiotherapie",
      "bacc_sante_sciences_soins_infirmiers",
      "bacc_sante_sciences_infirmieres",
    ].some((id) => selected.has(id));

    const dEsSanteSaufPlusHaut = [
      "doctorat_adjoint_medecin",
      "maitrise_adjoint_medecin",
      "doctorat_medecine",
      "doctorat_sante_pharmacie",
      "maitrise_sante_admin_sante",
      "maitrise_sante_biochimie",
      "maitrise_sante_biologie",
      "maitrise_sante_biologie_humaine",
      "maitrise_sante_diplome_sciences_vie",
      "maitrise_sante_genie_biomedical",
      "maitrise_sante_gestion_soins_sante",
      "maitrise_sante_integration_systemes_humains",
      "maitrise_sante_kinesiologie",
      "maitrise_sante_physiotherapie",
      "maitrise_sante_microbiologie",
      "maitrise_sante_physiologie_humaine",
      "maitrise_sante_environnementale_professionnelle",
      "maitrise_sante_publique",
    ].some((id) => selected.has(id));

    if (
      (baccSanteSaufPlusHaut || dEsSanteSaufPlusHaut) &&
      this.isAdmissibleOtherThanEducation("00398")
    ) {
      const critGSS = this.manualCriteria.find(
        (c) => c.id === "exp_00398_gestion",
      );
      if (critGSS) criteria.push(critGSS);
    }

    return criteria;
  });
  criteriaExperienceSecondaire = computed(() =>
    this.manualCriteria.filter(
      (c) => c.category === "Expérience" && c.subCategory === "secondaire",
    ),
  );
  criteriaExperienceSpecialises = computed(() =>
    this.manualCriteria.filter(
      (c) => c.category === "Expérience" && c.subCategory === "specialises",
    ),
  );
  criteriaExperienceUniversitaire = computed(() =>
    this.manualCriteria.filter(
      (c) => c.category === "Expérience" && c.subCategory === "universitaire",
    ),
  );

  expandedDomaines = signal<Set<string>>(new Set<string>());

  toggleDomaine(domaine: string) {
    const current = new Set(this.expandedDomaines());
    if (current.has(domaine)) {
      current.delete(domaine);
    } else {
      current.add(domaine);
    }
    this.expandedDomaines.set(current);
  }

  resetAll() {
    this.age.set(null);
    this.citizenship.set("Canadian Citizen");
    this.selectedProvince.set("QC");
    this.selectedCriteriaIds.set(new Set<string>());
    this.activeScolariteTab.set("secondaire");
    this.expandedDomaines.set(new Set<string>());
    this.selectedDossierJobId1.set("");
    this.selectedDossierJobId2.set("");
    this.selectedDossierJobId3.set("");
    this.searchDossierQuery1.set("");
    this.searchDossierQuery2.set("");
    this.searchDossierQuery3.set("");
    this.dropdownOpen1.set(false);
    this.dropdownOpen2.set(false);
    this.dropdownOpen3.set(false);
  }

  toggleManualCriterion(id: string) {
    const current = new Set(this.selectedCriteriaIds());
    if (current.has(id)) {
      current.delete(id);
    } else {
      current.add(id);

      // Auto-checking logic
      if (id === "cs_autre_dep") {
        current.add("sec4_24_credits");
      }

      if (id.startsWith("cs_")) {
        const crit = this.manualCriteria.find((c) => c.id === id);
        if (
          crit &&
          (crit.label.includes("DEP") || crit.label.includes("DEC"))
        ) {
          current.add("sec4_24_credits");
        }
      }

      if (
        id.startsWith("bacc_") ||
        id.startsWith("maitrise_") ||
        id.startsWith("doctorat_") ||
        id.startsWith("univ_")
      ) {
        current.add("sec4_24_credits");
      }

      if (id === "des_12e_annee") {
        current.add("sec4_24_credits");
        current.add("francais_sec4_10e");
        current.add("francais_sec5_11e");
        current.add("qc_10_gen"); // Math CST IV
        current.add("sci_tech4_sci10");
      }

      if (id === "qc_10_app") {
        current.add("qc_10_gen");
      }

      if (id === "qc_10_adv") {
        current.add("qc_10_app");
        current.add("qc_10_gen");
      }

      if (id === "qc_11_gen") {
        current.add("qc_10_gen");
      }

      if (id === "qc_11_app" || id === "qc_11_adv") {
        current.add("qc_10_gen");
        current.add("qc_10_app");
        current.add("qc_10_adv");
        current.add("qc_11_gen");
        current.add("qc_11_app");
        current.add("qc_11_adv");
      }

      if (id === "francais_sec5_11e") {
        current.add("francais_sec4_10e");
      }

      // Mutual exclusions for job 00152
      if (id === "exp_scslm") {
        current.delete("exp_acorplm");
      } else if (id === "exp_acorplm") {
        current.delete("exp_scslm");
      } else if (id === "exp_permis_reglementation") {
        current.delete("exp_lettre_conformite");
      } else if (id === "exp_lettre_conformite") {
        current.delete("exp_permis_reglementation");
      }

      // Mutual exclusions for job 00153
      if (id === "exp_permis_rad") {
        current.delete("exp_association_actrm");
      } else if (id === "exp_association_actrm") {
        current.delete("exp_permis_rad");
      }

      // Mutual exclusions for job 00166
      if (id === "exp_mus_ensembles") {
        current.delete("exp_mus_etudiant");
      } else if (id === "exp_mus_etudiant") {
        current.delete("exp_mus_ensembles");
      }

      // Auto-check logic for university cycles
      if (id.startsWith("bacc_")) {
        current.add("univ_1er_cycle_global");
        const crit = this.manualCriteria.find((c) => c.id === id);
        if (crit && crit.subCategory) {
          if (crit.subCategory === "Génie") current.add("univ_1er_cycle_genie");
          if (crit.subCategory === "Arts") current.add("univ_1er_cycle_arts");
          if (crit.subCategory === "Sciences")
            current.add("univ_1er_cycle_sciences");
          if (crit.subCategory === "Santé") current.add("univ_1er_cycle_sante");
        }
      }

      if (id.startsWith("maitrise_") || id.startsWith("doctorat_")) {
        current.add("univ_cycle_sup_global");
        const crit = this.manualCriteria.find((c) => c.id === id);
        if (crit && crit.subCategory) {
          if (crit.subCategory === "Maîtrise")
            current.add("univ_cycle_sup_maitrise");
          if (crit.subCategory === "Doctorat")
            current.add("univ_cycle_sup_doctorat");
        }
      }

      if (
        id === "univ_1er_cycle_genie" ||
        id === "univ_1er_cycle_arts" ||
        id === "univ_1er_cycle_sciences" ||
        id === "univ_1er_cycle_sante"
      ) {
        current.add("univ_1er_cycle_global");
      }

      if (
        id === "univ_cycle_sup_maitrise" ||
        id === "univ_cycle_sup_doctorat"
      ) {
        current.add("univ_cycle_sup_global");
      }
    }

    // Auto-cleanup orphaned experience choices
    const hasEduForPhoto =
      current.has("des_12e_annee") ||
      current.has("cs_photo_multimedia") ||
      current.has("bacc_arts_communications") ||
      current.has("bacc_arts_communication_visuelle");
    if (!hasEduForPhoto) {
      current.delete("exp_photo_design");
    }

    const allMathOptions = Object.values(this.MATH_COURSES).reduce(
      (
        acc: { id: string; label: string; grade: number; diff: number }[],
        courses,
      ) => acc.concat(courses),
      [],
    );
    const selectedMaths = allMathOptions.filter((m) => current.has(m.id));
    const hasMath = (grade: number, diff: number) => {
      return selectedMaths.some((m) => m.grade >= grade && m.diff >= diff);
    };
    const hasMath10App = hasMath(10, 2);

    const hasEduForConduire =
      (current.has("des_12e_annee") && hasMath10App) ||
      current.has("cs_sec_incendie") ||
      current.has("cs_tech_policieres") ||
      current.has("bacc_arts_justice_criminelle") ||
      current.has("bacc_arts_criminologie") ||
      current.has("bacc_arts_gestion_urgences") ||
      current.has("bacc_arts_etudes_judiciaires") ||
      current.has("bacc_arts_droit") ||
      current.has("bacc_arts_sci_policieres") ||
      current.has("bacc_arts_psychologie") ||
      current.has("bacc_arts_sociologie") ||
      current.has("bacc_arts_sec_publique") ||
      current.has("bacc_arts_sec_policieres") ||
      current.has("bacc_arts_admin_entreprise") ||
      current.has("bacc_arts_etudes_militaires") ||
      current.has("bacc_arts_etudes_internationales_cmr");
    if (!hasEduForConduire) {
      current.delete("exp_permis_conduire");
    }

    // Auto-cleanup for 00152 medical lab technologist
    if (!current.has("cs_tech_lab_med")) {
      current.delete("exp_scslm");
      current.delete("exp_acorplm");
      current.delete("exp_permis_reglementation");
      current.delete("exp_lettre_conformite");
      current.delete("exp_lab_6mois");
    }

    // Auto-cleanup for 00153 medical radiation technologist
    if (!current.has("cs_tech_radio_med")) {
      current.delete("exp_permis_rad");
      current.delete("exp_association_actrm");
    }
    if (
      !current.has("cs_tech_radio_med") &&
      !current.has("cs_dep_sante_infirmiers")
    ) {
      current.delete("exp_lettre_reglementation_en_regle");
    }

    // Auto-cleanup for 00155 biomedical electronics technologist
    if (!current.has("cs_tech_ing_biomed")) {
      current.delete("exp_tech_eb_6mois");
    }

    // Auto-cleanup for 00166 musician
    if (!current.has("des_12e_annee") || current.has("cs_etude_musique")) {
      current.delete("exp_mus_ensembles");
      current.delete("exp_mus_etudiant");
    }
    if (!current.has("cs_etude_musique")) {
      current.delete("exp_mus_pro");
    }

    // Auto-cleanup for 00164 cook
    if (!current.has("cs_dep_cuisine")) {
      current.delete("exp_sceau_rouge_cuisine");
    }

    // Auto-cleanup for 00335 dental assistant
    if (!current.has("cs_cert_assist_dentaire")) {
      current.delete("exp_permis_assistant_dentaire");
      current.delete("exp_lettre_dentaire_en_regle");
    }

    // Auto-cleanup for 00372 practical nurse
    if (!current.has("cs_dep_sante_infirmiers")) {
      current.delete("exp_permis_infirmier_auxiliaire");
      current.delete("exp_cert_peroperatoire");
    }

    // Auto-cleanup for 00406 paramedical
    if (!current.has("cs_cert_soins_param")) {
      current.delete("exp_permis_paramedical");
    }

    // Auto-cleanup for 00189
    const has00189Base =
      current.has("bacc_sci_environnementales") ||
      current.has("bacc_sci_geologie") ||
      current.has("bacc_sci_technologie_surete_protection_incendie") ||
      current.has("bacc_sci_geomatique") ||
      current.has("bacc_sci_arpentage") ||
      current.has("bacc_genie_chimie_chimique") ||
      current.has("bacc_genie_gestion") ||
      current.has("bacc_genie_ingenierie_gestion") ||
      current.has("bacc_genie_geologie");
    if (!has00189Base) {
      current.delete("exp_00189");
    }

    // Auto-cleanup for 00190
    if (
      !current.has("bacc_sante_physiotherapie") &&
      !current.has("maitrise_sante_physiotherapie")
    ) {
      current.delete("exp_permis_physiotherapie");
      current.delete("exp_lettre_physiotherapie_regle");
    }

    // Auto-cleanup for 00191
    if (!current.has("bacc_sante_medecine_dentaire")) {
      current.delete("exp_cert_bned");
      current.delete("exp_permis_medecine_dentaire");
      current.delete("exp_lettre_dentiste_regle");
      current.delete("exp_cv_dentiste_5ans");
    }

    // Auto-cleanup for 00194
    if (
      !current.has("bacc_sante_pharmacie") &&
      !current.has("doctorat_sante_pharmacie")
    ) {
      current.delete("exp_permis_pharmacie");
      current.delete("exp_lettre_pharmacie_regle");
    }

    // Auto-cleanup for 00195
    if (
      !current.has("bacc_sante_sciences_soins_infirmiers") &&
      !current.has("bacc_sante_sciences_infirmieres")
    ) {
      current.delete("exp_permis_soins_infirmiers");
    }

    // Auto-cleanup for 00198
    if (!current.has("maitrise_sante_service_social")) {
      current.delete("exp_permis_travail_social");
      current.delete("exp_lettre_travail_social_regle");
    }

    // Auto-cleanup for 00203
    const has00203Base =
      current.has("bacc_arts_communications") ||
      current.has("bacc_arts_relations_intern") ||
      current.has("bacc_arts_journalisme") ||
      current.has("bacc_arts_relations_publiques") ||
      current.has("bacc_arts_anglais_francais") ||
      current.has("bacc_arts_science_politique") ||
      current.has("bacc_arts_commercialisation") ||
      current.has("bacc_arts_medias_numeriques") ||
      current.has("bacc_arts_etudes_militaires") ||
      current.has("bacc_arts_anthropologie") ||
      current.has("bacc_arts_psychologie") ||
      current.has("bacc_arts_philosophie") ||
      current.has("bacc_arts_sociologie") ||
      current.has("bacc_arts_linguistique") ||
      current.has("maitrise_arts_communications") ||
      current.has("maitrise_arts_relations_internationales") ||
      current.has("maitrise_arts_journalisme") ||
      current.has("maitrise_arts_relations_publiques") ||
      current.has("maitrise_arts_anglais_francais") ||
      current.has("maitrise_arts_science_politique") ||
      current.has("maitrise_arts_commercialisation") ||
      current.has("maitrise_arts_medias_numeriques") ||
      current.has("maitrise_arts_etudes_militaires") ||
      current.has("maitrise_arts_anthropologie") ||
      current.has("maitrise_arts_psychologie") ||
      current.has("maitrise_arts_philosophie") ||
      current.has("maitrise_arts_sociologie") ||
      current.has("maitrise_arts_linguistique");
    if (!has00203Base) {
      current.delete("exp_00203");
    }

    // Auto-cleanup for 00204
    if (!current.has("bacc_arts_droit")) {
      current.delete("exp_permis_droit");
      current.delete("exp_lettre_barreau_regle");
    }

    // Auto-cleanup for 00208
    if (
      !current.has("bacc_arts_psychologie") &&
      !current.has("bacc_arts_sociologie")
    ) {
      current.delete("exp_00208_bacc");
    }

    // Auto-cleanup for 00211
    if (!current.has("maitrise_arts_education")) {
      current.delete("exp_00211_maitrise");
    }

    this.selectedCriteriaIds.set(current);
  }

  eligibleJobs = computed(() => {
    const citizenship = this.citizenship();
    const ageVal = this.age();

    const rawSelected = this.selectedCriteriaIds();
    if (rawSelected.size === 0) return [];

    // Process implications
    const selected = new Set(rawSelected);

    // Evaluate if user meets base math conditions based on selected province math courses.
    const allMathOptions = Object.values(this.MATH_COURSES).reduce(
      (acc, courses) => acc.concat(courses),
      [],
    );
    const selectedMaths = allMathOptions.filter((m) => selected.has(m.id));

    // To meet a grade + difficulty, you need ANY course with AT LEAST that grade, AND AT LEAST that diff.
    const hasMath = (grade: number, diff: number) => {
      return selectedMaths.some((m) => m.grade >= grade && m.diff >= diff);
    };

    if (hasMath(10, 1)) selected.add("base_math_10_gen");
    if (hasMath(10, 2)) selected.add("base_math_10_app");
    if (hasMath(10, 3)) selected.add("base_math_10_adv");
    if (hasMath(11, 1)) selected.add("base_math_11_gen");
    if (hasMath(11, 2)) selected.add("base_math_11_app");
    if (hasMath(11, 3)) selected.add("base_math_11_adv");
    if (hasMath(12, 1)) selected.add("base_math_12_gen");
    if (hasMath(12, 2)) selected.add("base_math_12_app");
    if (hasMath(12, 3)) selected.add("base_math_12_adv");

    // If PR < 3 years, they are not admissible to the Canadian Armed Forces at all.
    if (citizenship === "PR < 3 years") {
      return [];
    }

    const jobs = new Set<string>();
    const coursSpecialisesIds = this.criteriaCoursSpecialise().map((c) => c.id);

    for (const rule of this.jobRules) {
      let meetsRule = false;
      if (rule.customCheck) {
        meetsRule = rule.customCheck(selected, coursSpecialisesIds);
      } else if (
        rule.requiredCriteriaIds &&
        rule.requiredCriteriaIds.length > 0
      ) {
        meetsRule = rule.requiredCriteriaIds.every((id) => selected.has(id));
      }

      if (meetsRule) {
        for (const jId of rule.jobs) {
          // Under PR > 3 years, only RP-eligible jobs are permitted.
          if (citizenship === "PR > 3 years" && !this.jobService.isJobRp(jId)) {
            continue;
          }

          // Exclude closed (SIP) jobs
          if (this.jobService.isJobClosed(jId)) {
            continue;
          }

          // Age qualification logic:
          // Maximum service age is 59 (must retire at 60).
          // A candidate must have time to complete the initial contract length before reaching 60.
          if (ageVal !== null && ageVal > 0) {
            // Forced retirement at 60
            if (ageVal >= 60) {
              continue;
            }
            const job = this.jobService.getAllJobs().find((j) => j.id === jId);
            if (job) {
              const firstContract =
                job.contracts && job.contracts.length > 0
                  ? job.contracts[0]
                  : null;
              const durationYears = firstContract
                ? firstContract.duration.match(/(\d+)\s*an/)
                  ? parseInt(firstContract.duration.match(/(\d+)\s*an/)![1], 10)
                  : 3
                : 3;
              if (ageVal + durationYears > 60) {
                continue;
              }
            } else {
              if (ageVal + 3 > 60) {
                continue;
              }
            }
          }

          jobs.add(jId);
        }
      }
    }

    return Array.from(jobs).sort((a, b) => a.localeCompare(b));
  });

  jobsExcludedByAge = computed(() => {
    const citizenship = this.citizenship();
    const ageVal = this.age();
    if (ageVal === null || ageVal <= 0) return [];

    const rawSelected = this.selectedCriteriaIds();
    if (rawSelected.size === 0) return [];

    const selected = new Set(rawSelected);
    const allMathOptions = Object.values(this.MATH_COURSES).reduce(
      (acc, courses) => acc.concat(courses),
      [],
    );
    const selectedMaths = allMathOptions.filter((m) => selected.has(m.id));

    const hasMath = (grade: number, diff: number) => {
      return selectedMaths.some((m) => m.grade >= grade && m.diff >= diff);
    };

    if (hasMath(10, 1)) selected.add("base_math_10_gen");
    if (hasMath(10, 2)) selected.add("base_math_10_app");
    if (hasMath(10, 3)) selected.add("base_math_10_adv");
    if (hasMath(11, 1)) selected.add("base_math_11_gen");
    if (hasMath(11, 2)) selected.add("base_math_11_app");
    if (hasMath(11, 3)) selected.add("base_math_11_adv");
    if (hasMath(12, 1)) selected.add("base_math_12_gen");
    if (hasMath(12, 2)) selected.add("base_math_12_app");
    if (hasMath(12, 3)) selected.add("base_math_12_adv");

    if (citizenship === "PR < 3 years") {
      return [];
    }

    const excluded = [];
    const coursSpecialisesIds = this.criteriaCoursSpecialise().map((c) => c.id);

    for (const rule of this.jobRules) {
      let meetsRule = false;
      if (rule.customCheck) {
        meetsRule = rule.customCheck(selected, coursSpecialisesIds);
      } else if (
        rule.requiredCriteriaIds &&
        rule.requiredCriteriaIds.length > 0
      ) {
        meetsRule = rule.requiredCriteriaIds.every((id) => selected.has(id));
      }

      if (meetsRule) {
        for (const jId of rule.jobs) {
          if (citizenship === "PR > 3 years" && !this.jobService.isJobRp(jId)) {
            continue;
          }

          // Exclude closed (SIP) jobs
          if (this.jobService.isJobClosed(jId)) {
            continue;
          }

          const job = this.jobService.getAllJobs().find((j) => j.id === jId);
          if (job) {
            const firstContract =
              job.contracts && job.contracts.length > 0
                ? job.contracts[0]
                : null;
            const durationYears = firstContract
              ? firstContract.duration.match(/(\d+)\s*an/)
                ? parseInt(firstContract.duration.match(/(\d+)\s*an/)![1], 10)
                : 3
              : 3;

            if (ageVal + durationYears > 60) {
              excluded.push({
                id: job.id,
                title: job.title,
                duration: durationYears,
                requiredAge: 60 - durationYears,
              });
            }
          }
        }
      }
    }
    return excluded.sort((a, b) => a.id.localeCompare(b.id));
  });

  searchDossierQuery1 = signal<string>("");
  searchDossierQuery2 = signal<string>("");
  searchDossierQuery3 = signal<string>("");
  selectedDossierJobId1 = signal<string>("");
  selectedDossierJobId2 = signal<string>("");
  selectedDossierJobId3 = signal<string>("");
  dropdownOpen1 = signal<boolean>(false);
  dropdownOpen2 = signal<boolean>(false);
  dropdownOpen3 = signal<boolean>(false);

  allJobsList = computed(() => this.jobService.getAllJobs());

  filteredDossierJobs1 = computed(() =>
    this.filterJobsForSearch(this.searchDossierQuery1()),
  );
  filteredDossierJobs2 = computed(() =>
    this.filterJobsForSearch(this.searchDossierQuery2()),
  );
  filteredDossierJobs3 = computed(() =>
    this.filterJobsForSearch(this.searchDossierQuery3()),
  );

  filterJobsForSearch(query: string) {
    const jobs = this.allJobsList();
    if (!query || query.trim() === "") {
      return jobs;
    }
    const lowQuery = query.toLowerCase().trim();
    return jobs.filter(
      (j) =>
        j.id.includes(lowQuery) ||
        j.title.toLowerCase().includes(lowQuery) ||
        (j.abbreviation && j.abbreviation.toLowerCase().includes(lowQuery)),
    );
  }

  isFieldDisabled(index: number): boolean {
    const id1 = this.selectedDossierJobId1();
    const id2 = this.selectedDossierJobId2();
    const id3 = this.selectedDossierJobId3();
    
    if (index === 1) return (id2 === "00003" || id3 === "00003");
    if (index === 2) return (id1 === "00003" || id3 === "00003");
    if (index === 3) return (id1 === "00003" || id2 === "00003");
    return false;
  }

  selectDossierJob(index: number, jobId: string) {
    const qb = this.jobService.getAllJobs().find((j) => j.id === jobId);
    if (!qb) return;

    if (jobId === "00003") {
      if (index === 1) {
        this.selectedDossierJobId2.set("");
        this.searchDossierQuery2.set("");
        this.selectedDossierJobId3.set("");
        this.searchDossierQuery3.set("");
      } else if (index === 2) {
        this.selectedDossierJobId1.set("");
        this.searchDossierQuery1.set("");
        this.selectedDossierJobId3.set("");
        this.searchDossierQuery3.set("");
      } else if (index === 3) {
        this.selectedDossierJobId1.set("");
        this.searchDossierQuery1.set("");
        this.selectedDossierJobId2.set("");
        this.searchDossierQuery2.set("");
      }
    }

    if (index === 1) {
      this.selectedDossierJobId1.set(jobId);
      this.searchDossierQuery1.set(`${qb.id} - ${qb.title}`);
      this.dropdownOpen1.set(false);
    } else if (index === 2) {
      this.selectedDossierJobId2.set(jobId);
      this.searchDossierQuery2.set(`${qb.id} - ${qb.title}`);
      this.dropdownOpen2.set(false);
    } else if (index === 3) {
      this.selectedDossierJobId3.set(jobId);
      this.searchDossierQuery3.set(`${qb.id} - ${qb.title}`);
      this.dropdownOpen3.set(false);
    }
  }

  clearDossierJob(index: number, event: MouseEvent) {
    event.stopPropagation();
    if (index === 1) {
      this.selectedDossierJobId1.set("");
      this.searchDossierQuery1.set("");
      this.dropdownOpen1.set(false);
    } else if (index === 2) {
      this.selectedDossierJobId2.set("");
      this.searchDossierQuery2.set("");
      this.dropdownOpen2.set(false);
    } else if (index === 3) {
      this.selectedDossierJobId3.set("");
      this.searchDossierQuery3.set("");
      this.dropdownOpen3.set(false);
    }
  }

  onQueryChange(index: number, val: string) {
    if (index === 1) {
      this.searchDossierQuery1.set(val);
      if (!val) this.selectedDossierJobId1.set("");
    } else if (index === 2) {
      this.searchDossierQuery2.set(val);
      if (!val) this.selectedDossierJobId2.set("");
    } else if (index === 3) {
      this.searchDossierQuery3.set(val);
      if (!val) this.selectedDossierJobId3.set("");
    }
  }

  openDropdown(index: number) {
    if (this.isFieldDisabled(index)) return;
    if (index === 1) {
      this.dropdownOpen1.set(true);
      this.searchDossierQuery1.set("");
    } else if (index === 2) {
      this.dropdownOpen2.set(true);
      this.searchDossierQuery2.set("");
    } else if (index === 3) {
      this.dropdownOpen3.set(true);
      this.searchDossierQuery3.set("");
    }
  }

  closeDropdownDelayed(index: number) {
    setTimeout(() => {
      if (index === 1) {
        this.dropdownOpen1.set(false);
        const id = this.selectedDossierJobId1();
        if (id) {
          const qb = this.jobService.getAllJobs().find((j) => j.id === id);
          if (qb) this.searchDossierQuery1.set(`${qb.id} - ${qb.title}`);
        } else {
          this.searchDossierQuery1.set("");
        }
      } else if (index === 2) {
        this.dropdownOpen2.set(false);
        const id = this.selectedDossierJobId2();
        if (id) {
          const qb = this.jobService.getAllJobs().find((j) => j.id === id);
          if (qb) this.searchDossierQuery2.set(`${qb.id} - ${qb.title}`);
        } else {
          this.searchDossierQuery2.set("");
        }
      } else if (index === 3) {
        this.dropdownOpen3.set(false);
        const id = this.selectedDossierJobId3();
        if (id) {
          const qb = this.jobService.getAllJobs().find((j) => j.id === id);
          if (qb) this.searchDossierQuery3.set(`${qb.id} - ${qb.title}`);
        } else {
          this.searchDossierQuery3.set("");
        }
      }
    }, 200);
  }

  hasSelected(index: number): boolean {
    if (index === 1) return !!this.selectedDossierJobId1();
    if (index === 2) return !!this.selectedDossierJobId2();
    if (index === 3) return !!this.selectedDossierJobId3();
    return false;
  }

  checkJobEducationEligibility(jobId: string): { eligible: boolean } {
    const rules = this.jobRules.filter((r) => r.jobs.includes(jobId));
    if (rules.length === 0) {
      return { eligible: true };
    }

    const rawSelected = this.selectedCriteriaIds();
    const selected = new Set(rawSelected);

    const allMathOptions = Object.values(this.MATH_COURSES).reduce(
      (acc, courses) => acc.concat(courses),
      [],
    );
    const selectedMaths = allMathOptions.filter((m) => selected.has(m.id));

    const hasMath = (grade: number, diff: number) => {
      return selectedMaths.some((m) => m.grade >= grade && m.diff >= diff);
    };

    if (hasMath(10, 1)) selected.add("base_math_10_gen");
    if (hasMath(10, 2)) selected.add("base_math_10_app");
    if (hasMath(10, 3)) selected.add("base_math_10_adv");
    if (hasMath(11, 1)) selected.add("base_math_11_gen");
    if (hasMath(11, 2)) selected.add("base_math_11_app");
    if (hasMath(11, 3)) selected.add("base_math_11_adv");
    if (hasMath(12, 1)) selected.add("base_math_12_gen");
    if (hasMath(12, 2)) selected.add("base_math_12_app");
    if (hasMath(12, 3)) selected.add("base_math_12_adv");

    const coursSpecialisesIds = this.criteriaCoursSpecialise().map((c) => c.id);

    for (const rule of rules) {
      let meetsRule = false;
      if (rule.customCheck) {
        meetsRule = rule.customCheck(selected, coursSpecialisesIds);
      } else if (
        rule.requiredCriteriaIds &&
        rule.requiredCriteriaIds.length > 0
      ) {
        meetsRule = rule.requiredCriteriaIds.every((id) => selected.has(id));
      }

      if (meetsRule) {
        return { eligible: true };
      }
    }
    return { eligible: false };
  }

  isAdmissibleOtherThanEducation(jobId: string): boolean {
    if (!jobId) return false;
    if (jobId === "00003") return false;
    const job = this.jobService.getAllJobs().find((j) => j.id === jobId);
    if (!job) return false;

    if (this.jobService.isJobClosed(jobId)) {
      return false;
    }

    const ageVal = this.age();
    const citizenshipVal = this.citizenship();

    const firstContract =
      job.contracts && job.contracts.length > 0 ? job.contracts[0] : null;
    const durationYears = firstContract
      ? firstContract.duration.match(/(\d+)\s*an/)
        ? parseInt(firstContract.duration.match(/(\d+)\s*an/)![1], 10)
        : 3
      : 3;

    if (ageVal !== null && ageVal > 0) {
      if (ageVal >= 60 || ageVal + durationYears > 60) {
        return false;
      }
    }

    if (citizenshipVal === "PR < 3 years") {
      return false;
    } else if (citizenshipVal === "PR > 3 years") {
      if (!this.jobService.isJobRp(jobId)) {
        return false;
      }
    }

    return true;
  }

  evaluateJobAdmissibility(jobId: string) {
    if (!jobId) return null;
    const job = this.jobService.getAllJobs().find((j) => j.id === jobId);
    if (!job) return null;

    if (jobId === "00003") {
      return {
        job,
        isEligible: false,
        isAgeAdmissible: false,
        ageReason: "",
        isCitizenshipAdmissible: false,
        citizenshipReason: "",
        isEducationAdmissible: false,
        educationReason: "",
        durationYears: 3,
        isJobClosed: false,
      };
    }

    const ageVal = this.age();
    const citizenshipVal = this.citizenship();

    let isAgeAdmissible = true;
    let ageReason = "";
    const firstContract =
      job.contracts && job.contracts.length > 0 ? job.contracts[0] : null;
    const durationYears = firstContract
      ? firstContract.duration.match(/(\d+)\s*an/)
        ? parseInt(firstContract.duration.match(/(\d+)\s*an/)![1], 10)
        : 3
      : 3;

    if (ageVal !== null && ageVal > 0) {
      if (ageVal >= 60) {
        isAgeAdmissible = false;
        ageReason =
          "L'âge maximal de service est de 59 ans (retraite forcée à 60 ans).";
      } else if (ageVal + durationYears > 60) {
        isAgeAdmissible = false;
        ageReason = `L'âge limite dépasse avant la fin du contrat initial (${durationYears} ans). L'âge maximal de l'enrôlement est de ${60 - durationYears} ans.`;
      }
    }

    let isCitizenshipAdmissible = true;
    let citizenshipReason = "";
    if (citizenshipVal === "PR < 3 years") {
      isCitizenshipAdmissible = false;
      citizenshipReason =
        "Les résidents permanents de moins de trois ans ne sont pas admissibles aux Forces armées canadiennes.";
    } else if (citizenshipVal === "PR > 3 years") {
      const isRpAllowed = this.jobService.isJobRp(jobId);
      if (!isRpAllowed) {
        isCitizenshipAdmissible = false;
        citizenshipReason =
          "Ce métier est réservé aux citoyens canadiens uniquement (CC).";
      }
    }

    let isEducationAdmissible = true;
    let educationReason = "";
    const eduCheckSubmit = this.checkJobEducationEligibility(jobId);
    if (!eduCheckSubmit.eligible) {
      isEducationAdmissible = false;
      educationReason = "Les critères requis ne sont pas rencontrés.";
    }

    const isEligible =
      isAgeAdmissible && isCitizenshipAdmissible && isEducationAdmissible;
    const isJobClosed = this.jobService.isJobClosed(jobId);

    return {
      job,
      isEligible,
      isAgeAdmissible,
      ageReason,
      isCitizenshipAdmissible,
      citizenshipReason,
      isEducationAdmissible,
      educationReason,
      durationYears,
      isJobClosed,
    };
  }

  reset() {
    this.age.set(null);
    this.citizenship.set("Canadian Citizen");
    this.selectedCriteriaIds.set(new Set<string>());
    this.selectedDossierJobId1.set("");
    this.selectedDossierJobId2.set("");
    this.selectedDossierJobId3.set("");
    this.searchDossierQuery1.set("");
    this.searchDossierQuery2.set("");
    this.searchDossierQuery3.set("");
    this.dropdownOpen1.set(false);
    this.dropdownOpen2.set(false);
    this.dropdownOpen3.set(false);
  }

  getMissingProofs(jobId: string): { fr: string[]; en: string[] } {
    const proofs = { fr: [] as string[], en: [] as string[] };
    const selected = this.selectedCriteriaIds();

    if (jobId === "00137") {
      if (!selected.has("exp_photo_design")) {
        proofs.fr.push(
          "Expérience dans un ou plusieurs des domaines suivants : photographie, photojournalisme, conception graphique ou multimédia.",
        );
        proofs.en.push(
          "Experience in one or more of the following fields: photography, photojournalism, graphic design, or multimedia.",
        );
      }
    }
    if (jobId === "00149" || jobId === "00161" || jobId === "00214") {
      if (!selected.has("exp_permis_conduire")) {
        proofs.fr.push(
          "Détenir un permis de conduire provincial/territorial en règle.",
        );
        proofs.en.push("Hold a valid provincial/territorial driver’s license.");
      }
    }
    if (jobId === "00152") {
      if (!selected.has("exp_scslm") && !selected.has("exp_acorplm")) {
        proofs.fr.push(
          "Fournir soit la certification de la Société canadienne de science de laboratoire médical (SCSLM) OU la certification de l'alliance canadienne des organismes de réglementation des professionnels de laboratoire médical (ACORPLM), incluant la réussite des examens du «TLM généraliste».",
        );
        proofs.en.push(
          'Provide either the certification from the Canadian Society for Medical Laboratory Science (CSMLS) OR the certification from the Canadian Alliance of Medical Laboratory Professionals Regulators (CAMLPR), including successfully passing the "General MLT" exams.',
        );
      }
      if (
        !selected.has("exp_permis_reglementation") &&
        !selected.has("exp_lettre_conformite")
      ) {
        proofs.fr.push(
          "Fournir un permis ou inscription sans restriction (statut actif) délivré par l’autorité de réglementation provinciale ou territoriale OU une Lettre de conformité (« Good Standing ») émise par l’autorité de réglementation.",
        );
        proofs.en.push(
          "Provide an unrestricted license or registration (active status) issued by the provincial or territorial regulatory authority OR a Letter of Good Standing issued by the regulatory authority.",
        );
      }
      if (!selected.has("exp_lab_6mois")) {
        proofs.fr.push(
          "Au moins six mois d'expérience à temps plein ou à temps partiel dans un laboratoire médical clinique au cours des deux dernières années.",
        );
        proofs.en.push(
          "At least six months of full-time or part-time clinical medical laboratory experience within the last two years.",
        );
      }
    }
    if (jobId === "00153") {
      if (
        !selected.has("exp_permis_rad") &&
        !selected.has("exp_association_actrm")
      ) {
        proofs.fr.push(
          "Fournir soit un permis, une certification ou autorisation sans restriction d’exercer comme technologue en radiation médicale (en règle et en vigueur) provenant d’un organisme de réglementation provincial/territorial reconnu OU la certification d’une association professionnelle ayant conclu une entente réciproque avec l’Association canadienne des technologues en radiation médicale (ACTRM).",
        );
        proofs.en.push(
          "Provide either an unrestricted license, certification, or practice permit to practice as a medical radiation technologist (in good standing and active) from a recognized provincial/territorial regulatory body OR certification from a professional association with a reciprocal agreement with CAMRT.",
        );
      }
      if (!selected.has("exp_lettre_reglementation_en_regle")) {
        proofs.fr.push(
          "Fournir une lettre de l'organisme de réglementation de la profession du candidat attestant que ce dernier est « en règle ».",
        );
        proofs.en.push(
          'Provide a letter from the professional regulatory body confirming that the candidate is "in good standing".',
        );
      }
    }
    if (jobId === "00155") {
      if (!selected.has("exp_tech_eb_6mois")) {
        proofs.fr.push(
          "A travaillé en tant que technologue en électronique biomédicale pendant une période totale d’au moins six (6) mois au cours des deux (2) dernières années.",
        );
        proofs.en.push(
          "Had worked as a biomedical electronics technologist for a total period of at least six (6) months within the last two (2) years.",
        );
      }
    }
    if (jobId === "00189") {
      const hasBase1 =
        selected.has("bacc_sci_environnementales") ||
        selected.has("bacc_sci_geologie") ||
        selected.has("bacc_sci_technologie_surete_protection_incendie") ||
        selected.has("bacc_sci_geomatique") ||
        selected.has("bacc_sci_arpentage") ||
        selected.has("bacc_genie_chimie_chimique") ||
        selected.has("bacc_genie_gestion") ||
        selected.has("bacc_genie_ingenierie_gestion") ||
        selected.has("bacc_genie_geologie");
      const hasBase2 =
        selected.has("bacc_sci_bsc_genie_protection_incendie") ||
        selected.has("bacc_genie_civil") ||
        selected.has("bacc_genie_mecanique") ||
        selected.has("bacc_genie_electricite_electrique") ||
        selected.has("bacc_genie_environnemental");
      if (hasBase1 && !hasBase2) {
        if (!selected.has("exp_00189")) {
          proofs.fr.push(
            "Au moins trois mois d'expérience pertinente dans un ou plusieurs des domaines suivants : industrie de la construction, gestion des installations, services d'incendies, services de l'environnement, géomatique, gestion de projet, service militaire.",
          );
          proofs.en.push(
            "At least three months of relevant experience in one or more of the following fields: construction industry, facility management, fire services, environmental services, geomatics, project management, military service.",
          );
        }
      }
    }
    if (jobId === "00190") {
      if (!selected.has("exp_permis_physiotherapie")) {
        proofs.fr.push(
          "Permis/licence d’exercice en règle (à titre actif) en tant que physiothérapeute émis par un organisme de réglementation provincial ou territorial.",
        );
        proofs.en.push(
          "Valid (active) license/permit to practice as a physiotherapist issued by a provincial or territorial regulatory body.",
        );
      }
      if (!selected.has("exp_lettre_physiotherapie_regle")) {
        proofs.fr.push(
          "Lettre de l’organisme de réglementation du candidat attestant que ce dernier est « En règle ».",
        );
        proofs.en.push(
          'Letter from the candidate\'s regulatory body confirming they are "In good standing".',
        );
      }
    }
    if (jobId === "00191") {
      if (!selected.has("exp_cert_bned")) {
        proofs.fr.push(
          "Certificat du Bureau national d’examen dentaire du Canada (BNED).",
        );
        proofs.en.push(
          "Certificate from the National Dental Examining Board of Canada (NDEB).",
        );
      }
      if (!selected.has("exp_permis_medecine_dentaire")) {
        proofs.fr.push(
          "Autorisation en règle et sans restriction d’exercer la Médecine dentaire de la part d’une autorité réglementaire d’une province/d’un territoire du Canada.",
        );
        proofs.en.push(
          "Valid and unrestricted license/permit to practice Dentistry from a provincial/territorial regulatory authority in Canada.",
        );
      }
      if (!selected.has("exp_lettre_dentiste_regle")) {
        proofs.fr.push(
          "Lettre de l’autorité réglementaire professionnelle attestant que le candidat est en règle.",
        );
        proofs.en.push(
          "Letter from the professional regulatory authority confirming that the candidate is in good standing.",
        );
      }
      if (!selected.has("exp_cv_dentiste_5ans")) {
        proofs.fr.push(
          "Curriculum vitae remontant jusqu’à de cinq ans quant à l’expérience en tant que dentiste.",
        );
        proofs.en.push(
          "Curriculum vitae going back up to five years regarding experience as a dentist.",
        );
      }
    }
    if (jobId === "00194") {
      if (!selected.has("exp_permis_pharmacie")) {
        proofs.fr.push(
          "Permis d’exercice de la pharmacie sans restriction en règle.",
        );
        proofs.en.push("Valid unrestricted license to practice pharmacy.");
      }
      if (!selected.has("exp_lettre_pharmacie_regle")) {
        proofs.fr.push(
          "Lettre de l’autorité de réglementation professionnelle attestant que le candidat est « en règle ».",
        );
        proofs.en.push(
          'Letter from the professional regulatory authority confirming that the candidate is in "good standing".',
        );
      }
    }
    if (jobId === "00195") {
      if (!selected.has("exp_permis_soins_infirmiers")) {
        proofs.fr.push(
          "Permis d’exercice en règle (état actif) en soins infirmiers en tant qu’infirmier autorisé ou infirmier en pratique octroyé par un organisme de réglementation provincial ou territorial du Canada.",
        );
        proofs.en.push(
          "Valid (active state) nursing practice license as a registered nurse or practical nurse issued by a provincial or territorial regulatory body in Canada.",
        );
      }
    }
    if (jobId === "00198") {
      if (!selected.has("exp_permis_travail_social")) {
        proofs.fr.push(
          "Permis en règle et sans restriction (état actif) d’exercer comme travailleur social, délivré par une autorité / association réglementaire provinciale ou territoriale.",
        );
        proofs.en.push(
          "Valid and unrestricted license/permit (active state) to practice as a social worker issued by a provincial or territorial regulatory authority/association.",
        );
      }
      if (!selected.has("exp_lettre_travail_social_regle")) {
        proofs.fr.push(
          "Lettre de l’autorité de réglementation professionnelle attestant que le candidat est « en règle ».",
        );
        proofs.en.push(
          'Letter from the professional regulatory authority confirming that the candidate is in "good standing".',
        );
      }
    }
    if (jobId === "00203") {
      if (!selected.has("exp_00203")) {
        proofs.fr.push(
          "Fournir une preuve d’au moins une (1) année d’expérience cumulative dans deux ou plusieurs des domaines suivants : communications, journalisme, commercialisation, affaires publiques, relations publiques, recherche sur l'opinion publique, médias numériques ou sociaux.",
        );
        proofs.en.push(
          "Provide proof of at least one (1) year of cumulative experience in two or more of the following fields: communications, journalism, marketing, public affairs, public relations, public opinion research, digital or social media.",
        );
      }
    }
    if (jobId === "00204") {
      if (!selected.has("exp_permis_droit")) {
        proofs.fr.push(
          "Autorisé à pratiquer le droit dans une province canadienne ou un territoire canadien.",
        );
        proofs.en.push(
          "Authorized to practice law in a Canadian province or territory.",
        );
      }
      if (!selected.has("exp_lettre_barreau_regle")) {
        proofs.fr.push(
          "Être « membre en règle », en exercice ou non, du Barreau d'une province ou d’un territoire.",
        );
        proofs.en.push(
          'Be a "member in good standing", practicing or non-practicing, of the Bar of a province or territory.',
        );
      }
    }
    if (jobId === "00208") {
      if (
        (selected.has("bacc_arts_psychologie") ||
          selected.has("bacc_arts_sociologie")) &&
        !selected.has("exp_00208_bacc")
      ) {
        proofs.fr.push(
          "Au moins une ou plusieurs années de travail à temps plein dans un ou plusieurs des domaines suivants : sélection, recrutement (RH), recherche en sciences sociales, orientation scolaire/professionnelle.",
        );
        proofs.en.push(
          "At least one or more years of full-time work in one or more of the following fields: selection, recruitment (HR), social science research, academic/career counseling.",
        );
      }
    }
    if (jobId === "00211") {
      if (
        selected.has("maitrise_arts_education") &&
        !selected.has("exp_00211_maitrise")
      ) {
        proofs.fr.push(
          "Fournir une preuve d’au moins trois (3) ans cumulatifs d’expérience à temps plein dans l’un ou plusieurs des domaines suivants : élaboration d’un programme d’études, expert-conseil en éducation, conception de l’instruction, formation du personnel, enseignement/instruction, expert-conseil en instruction, développement de l’instruction.",
        );
        proofs.en.push(
          "Provide proof of at least three (3) cumulative years of full-time experience in one or more of the following fields: curriculum development, education consultant, instructional design, staff training, teaching/instruction, instructional consultant, instructional development.",
        );
      }
    }
    if (jobId === "00164") {
      if (
        selected.has("cs_dep_cuisine") &&
        !selected.has("exp_sceau_rouge_cuisine")
      ) {
        proofs.fr.push(
          "Fournir une preuve de détention d’un Certificat des normes interprovinciales Sceau rouge.",
        );
        proofs.en.push(
          "Provide proof of holding a Red Seal interprovincial standards certification.",
        );
      }
    }
    if (jobId === "00166") {
      if (selected.has("cs_etude_musique")) {
        if (!selected.has("exp_mus_pro")) {
          proofs.fr.push(
            "Fournir une preuve d’expérience comme musicien professionnel dans une variété d’ensembles et dans divers styles de musique, p. ex. à titre de musicien travaillant à son propre compte, ou à temps plein avec une orchestre, un ensemble ou un groupe de musique local.",
          );
          proofs.en.push(
            "Provide proof of experience as a professional musician in a variety of ensembles and in various styles of music, e.g. as a self-employed musician, or full-time with a local orchestra, ensemble, or music group.",
          );
        }
      } else if (selected.has("des_12e_annee")) {
        if (
          !selected.has("exp_mus_ensembles") &&
          !selected.has("exp_mus_etudiant")
        ) {
          proofs.fr.push(
            "Fournir soit une preuve d’expérience comme musicien dans une variété d’ensembles et dans divers styles de musique, p. ex. à titre de musicien travaillant à son propre compte, ou à temps plein avec une orchestre, un ensemble ou un groupe de musique local, OU une preuve de statut d’étudiant en voie d’obtenir un diplôme ou un Baccalauréat en interprétation musicale dans un collège, un conservatoire de musique ou une université reconnus.",
          );
          proofs.en.push(
            "Provide either proof of experience as a musician in a variety of ensembles and in various styles of music, e.g. as a self-employed musician, or full-time with a local orchestra, ensemble, or music group, OR proof of student status on track to obtain a diploma or Bachelor’s degree in music performance in a recognized college, music conservatory, or university.",
          );
        }
      }
    }

    if (jobId === "00335") {
      if (selected.has("cs_cert_assist_dentaire")) {
        if (!selected.has("exp_permis_assistant_dentaire")) {
          proofs.fr.push(
            "Fournir une preuve de permis en règle pour agir en tant qu’assistant dentaire délivré par une autorité de réglementation canadienne provinciale ou territoriale.",
          );
          proofs.en.push(
            "Provide proof of a valid registration/license as a dental assistant issued by a Canadian provincial or territorial regulatory authority.",
          );
        }
        if (!selected.has("exp_lettre_dentaire_en_regle")) {
          proofs.fr.push(
            "Fournir une lettre de l’autorité de réglementation professionnelle attestant que le candidat est « en règle ».",
          );
          proofs.en.push(
            'Provide a letter from the professional regulatory authority confirming that the candidate is "in good standing".',
          );
        }
      }
    }

    if (jobId === "00372") {
      if (selected.has("cs_dep_sante_infirmiers")) {
        if (!selected.has("exp_permis_infirmier_auxiliaire")) {
          proofs.fr.push(
            "Fournir une preuve de détention d’une autorisation en règle de travailler comme infirmier auxiliaire autorisé/immatriculé émise par un organisme de réglementation provincial ou territorial.",
          );
          proofs.en.push(
            "Provide proof of holding a valid registration/license as a licensed/registered practical nurse issued by a provincial or territorial regulatory authority.",
          );
        }
        if (!selected.has("exp_lettre_reglementation_en_regle")) {
          proofs.fr.push(
            "Fournir une lettre de l’organisme de réglementation de la profession du candidat attestant que ce dernier est « en règle ».",
          );
          proofs.en.push(
            'Provide a letter from the professional regulatory authority confirming that the candidate is "in good standing".',
          );
        }
        if (!selected.has("exp_cert_peroperatoire")) {
          proofs.fr.push(
            "Fournir une preuve de certification comme infirmier auxiliaire autorisé/immatriculé en soins peropératoires.",
          );
          proofs.en.push(
            "Provide proof of certification as a licensed/registered practical nurse in perioperative care.",
          );
        }
      }
    }

    if (jobId === "00406") {
      if (selected.has("cs_cert_soins_param")) {
        if (!selected.has("exp_permis_paramedical")) {
          proofs.fr.push(
            "Fournir une preuve d'inscription actuelle ou en cours au permis ou privilèges hospitaliers de base ou certification en vigueur pour exercer à titre de paramédical(e), délivrés par un organisme de réglementation provincial ou territorial canadien.",
          );
          proofs.en.push(
            "Provide proof of current registration/licensure or active base hospital standard privileges or certification to practice as a paramedic, issued by a Canadian provincial or territorial regulatory authority.",
          );
        }
      }
    }

    if (jobId === "00349") {
      if (!selected.has("exp_00349_leader_foi")) {
        proofs.fr.push(
          "Accrédité et reconnu comme un leader au sein d’une tradition de foi  par l’autorité de gouvernance de cette même tradition de foi qui exerce une supervision au Canada, et tel que recommandé par le membre désigné du CIAMC.",
        );
        proofs.en.push(
          "Accredited and recognized as a faith group leader by the governing authority of that faith group which exercises supervision in Canada, and as recommended by the designated member of the ICCDF.",
        );
      }
      if (!selected.has("exp_00349_endosse_ciamc")) {
        proofs.fr.push("Avoir été endossé comme aumônier par le CIAMC.");
        proofs.en.push("Be endorsed as a chaplain by the ICCDF.");
      }
      if (!selected.has("exp_00349_entrevue_aum")) {
        proofs.fr.push(
          "Avoir réussi une entrevue et jugé apte par un comité présidé par le D Svc Aum.  La sélection finale est confirmée par l’Aumônier général.",
        );
        proofs.en.push(
          "Successfully pass an interview and be deemed suitable by a committee chaired by the D Chap Svc. Final selection is confirmed by the Chaplain General.",
        );
      }
    }

    if (jobId === "00374") {
      if (!selected.has("exp_00374_cert_permis")) {
        proofs.fr.push(
          "Certificat en règle du Conseil de certification des adjoints au médecin du Canada (CCAMC) et permis/licence en règle (en vigueur) d’exercer comme adjoint au médecin délivré(e) par une autorité réglementaire d’une province ou d’un territoire du Canada.",
        );
        proofs.en.push(
          "Valid certification from the Physician Assistant Certification Council of Canada (PACCC) and a valid active license to practice as a physician assistant issued by a provincial or territorial regulatory authority of Canada.",
        );
      }
      if (!selected.has("exp_00374_lettre_regle")) {
        proofs.fr.push(
          "Lettre de l’autorité professionnelle réglementaire ou de son superviseur en clinique, selon le cas, attestant que le candidat est en règle.",
        );
        proofs.en.push(
          "Letter from the professional regulatory authority or clinical supervisor, as applicable, confirming that the candidate is in good standing.",
        );
      }
    }

    if (jobId === "00390") {
      if (!selected.has("exp_00390_residence")) {
        proofs.fr.push(
          "Achèvement d’une formation spécialisée dans un programme de résidence agréé par le Collège royal des médecins et chirurgiens du Canada dans l’une des spécialités suivantes:\n- Médecine interne avec une résidence de deux ans dans l’une des disciplines suivantes;\n    a) Médecine interne générale\n    b) Maladies infectieuses\n    c) Soins intensifs\n- Anesthésiologie\n- Chirurgie générale\n- Chirurgie orthopédique\n- Psychiatrie\n- Radiologie\n- Médecine physique et de réadaptation (Physiatrie)\n- Médecine d’urgence.",
        );
        proofs.en.push(
          "Completion of specialized training in a residency program accredited by the Royal College of Physicians and Surgeons of Canada in one of the following specialties:\n- Internal medicine with a two-year residency in one of the following disciplines;\n    a) General internal medicine\n    b) Infectious diseases\n    c) Critical care\n- Anesthesiology\n- General surgery\n- Orthopedic surgery\n- Psychiatry\n- Radiology\n- Physical medicine and rehabilitation (Physiatry)\n- Emergency medicine.",
        );
      }
      if (!selected.has("exp_00390_certification")) {
        proofs.fr.push(
          "Certification et titre de fellow du Collège royal des médecins et chirurgiens du Canada, dans l’une des spécialités mentionnées ci-dessus.",
        );
        proofs.en.push(
          "Certification and fellowship designation from the Royal College of Physicians and Surgeons of Canada in one of the specialties mentioned above.",
        );
      }
      if (!selected.has("exp_00390_permis")) {
        proofs.fr.push(
          "Permis d’exercice valide et sans restriction pour pratiquer la médecine à titre de spécialiste (selon la spécialité indiquée ci-dessus) dans toute province ou tout territoire du Canada.",
        );
        proofs.en.push(
          "Valid and unrestricted license to practice medicine as a specialist (according to the specialty indicated above) in any province or territory of Canada.",
        );
      }
      if (!selected.has("exp_00390_attestation")) {
        proofs.fr.push(
          "Attestation de bonne conduite professionnelle délivrée par l’organisme de réglementation provincial ou territorial du candidat.",
        );
        proofs.en.push(
          "Certificate of professional good standing issued by the candidate’s provincial or territorial regulatory body.",
        );
      }
      if (!selected.has("exp_00390_civil")) {
        proofs.fr.push(
          "Pour toutes les spécialités : à l’exception de la psychiatrie et de la médecine physique et réadaptation (physiatrie): Être employé à temps plein dans un poste clinique au sein d’un établissement de soins de santé civil.",
        );
        proofs.en.push(
          "For all specialties, except psychiatry and physical medicine and rehabilitation (physiatry): Be employed full-time in a clinical position within a civilian healthcare facility.",
        );
      }
    }

    if (jobId === "00393") {
      if (!selected.has("exp_00393_autorisation")) {
        proofs.fr.push(
          "Détenir une Autorisation en règle et sans restriction d’exercer la Médecine en tant que médecin de famille dans une province ou un territoire du Canada.",
        );
        proofs.en.push(
          "Hold a valid and unrestricted license to practice Family Medicine in a province or territory of Canada.",
        );
      }
      if (!selected.has("exp_00393_lettre_regle")) {
        proofs.fr.push(
          "Lettre des autorités de réglementation de la province/territoire du candidat attestant que ce dernier est « en règle ».",
        );
        proofs.en.push(
          'Letter from the regulatory authorities of the candidate’s province/territory confirming that the candidate is in "good standing".',
        );
      }
      if (!selected.has("exp_00393_certification")) {
        proofs.fr.push(
          "Certification en médecine familiale du Collège des médecins de famille du Canada.",
        );
        proofs.en.push(
          "Certification in Family Medicine from the College of Family Physicians of Canada.",
        );
      }
    }

    if (jobId === "00398") {
      const option1Selected =
        selected.has("bacc_sante_gestion_services_sante") ||
        selected.has("bacc_sante_admin_soins_sante");
      const option2Selected =
        selected.has("bacc_arts_admin_affaires") ||
        selected.has("bacc_arts_admin_publique") ||
        selected.has("bacc_arts_ressources_humaines");
      const option3Selected =
        selected.has("maitrise_sante_gestion_services_sante") ||
        selected.has("maitrise_sante_admin_soins_sante") ||
        selected.has("maitrise_admin_affaires") ||
        selected.has("maitrise_admin_publique") ||
        selected.has("maitrise_gestion_ressources_humaines");
      const baccSanteSaufPlusHaut = [
        "bacc_sante_adjoint_medecin",
        "bacc_sante_biochimie",
        "bacc_sante_biologie",
        "bacc_sante_biologie_humaine",
        "bacc_sante_diplome_sciences_vie",
        "bacc_sante_genie_biomedical",
        "bacc_sante_kinesiologie",
        "bacc_sante_medecine_dentaire",
        "bacc_sante_microbiologie",
        "bacc_sante_pharmacie",
        "bacc_sante_physiologie_humaine",
        "bacc_sante_physiotherapie",
        "bacc_sante_sciences_soins_infirmiers",
        "bacc_sante_sciences_infirmieres",
      ].some((id) => selected.has(id));

      const dEsSanteSaufPlusHaut = [
        "doctorat_adjoint_medecin",
        "maitrise_adjoint_medecin",
        "doctorat_medecine",
        "doctorat_sante_pharmacie",
        "maitrise_sante_admin_sante",
        "maitrise_sante_biochimie",
        "maitrise_sante_biologie",
        "maitrise_sante_biologie_humaine",
        "maitrise_sante_diplome_sciences_vie",
        "maitrise_sante_genie_biomedical",
        "maitrise_sante_gestion_soins_sante",
        "maitrise_sante_integration_systemes_humains",
        "maitrise_sante_kinesiologie",
        "maitrise_sante_physiotherapie",
        "maitrise_sante_microbiologie",
        "maitrise_sante_physiologie_humaine",
        "maitrise_sante_environnementale_professionnelle",
        "maitrise_sante_publique",
      ].some((id) => selected.has(id));

      if (
        (baccSanteSaufPlusHaut || dEsSanteSaufPlusHaut) &&
        !option1Selected &&
        !option2Selected &&
        !option3Selected
      ) {
        if (!selected.has("exp_00398_gestion")) {
          proofs.fr.push(
            "Un minimum de deux années d’expérience cumulative en gestion à temps plein au cours des cinq dernières années dans un milieu de soins de santé.",
          );
          proofs.en.push(
            "A minimum of two years of cumulative full-time management experience within the last five years in a healthcare environment.",
          );
        }
      }
    }

    return proofs;
  }

  generateNoteText() {
    const jobIds = this.eligibleJobs();
    if (jobIds.length === 0)
      return "Aucun critère sélectionné. Impossible de générer la note.";

    let text = "Évaluation de réorientation\\n====================\\n\\n";
    text += "Critères rencontrés :\\n";
    const selected = this.selectedCriteriaIds();
    const criteriaArray = Array.from(selected);
    const allMathOptions = Object.values(this.MATH_COURSES).reduce(
      (acc: any[], courses: any) => acc.concat(courses),
      [],
    );

    for (const id of criteriaArray) {
      if (id.startsWith("base_math_")) continue; // Skip virtual base criteria

      const crit = this.manualCriteria.find((c) => c.id === id);
      if (crit) {
        text += "- " + crit.label + "\\n";
      } else {
        const mathOpt = allMathOptions.find((m) => m.id === id);
        if (mathOpt) {
          text += "- " + mathOpt.label + "\\n";
        }
      }
    }
    text += "\\nMétiers admissibles :\\n";
    for (const jId of jobIds) {
      const job = this.jobService.getAllJobs().find((j) => j.id === jId);
      if (job) {
        text += "- " + job.id + " - " + job.title + "\\n";
      } else {
        text += "- " + jId + "\\n";
      }
    }

    let hasMissingProofs = false;
    let missingProofsText = "\\nPreuves supplémentaires requises :\\n";
    for (const jId of jobIds) {
      const missing = this.getMissingProofs(jId);
      if (missing.fr.length > 0) {
        hasMissingProofs = true;
        const job = this.jobService.getAllJobs().find((j) => j.id === jId);
        const title = job ? `${job.id} - ${job.title}` : jId;
        missingProofsText += `\\nPour le métier ${title} :\\n`;
        for (const proof of missing.fr) {
          missingProofsText += `- ${proof}\\n`;
        }
      }
    }

    if (hasMissingProofs) {
      text += missingProofsText;
    }

    return text;
  }

  copied = signal(false);
  noteCopied = signal(false);

  generateNoteRegistry(): string {
    const dossierIds = [
      this.selectedDossierJobId1(),
      this.selectedDossierJobId2(),
      this.selectedDossierJobId3(),
    ].filter((id) => !!id);

    let metierRaison = "";

    if (dossierIds.length === 0) {
      metierRaison = "aucun métier sélectionné au dossier";
    } else {
      const parts: string[] = [];
      for (const id of dossierIds) {
        if (id === "00003") {
          parts.push(`00003 : Sans métier`);
          continue;
        }
        const s = this.evaluateJobAdmissibility(id);
        let reasonFr = "";
        if (s) {
          const reasonsFrList: string[] = [];
          if (s.isJobClosed) {
            reasonsFrList.push("Fermé");
          }
          if (!s.isAgeAdmissible) {
            reasonsFrList.push("Âge");
          }
          if (!s.isCitizenshipAdmissible) {
            reasonsFrList.push("Citoyenneté requise");
          }
          if (!s.isEducationAdmissible) {
            reasonsFrList.push("Scolarité/Expérience");
          }

          if (reasonsFrList.length > 0) {
            reasonFr = reasonsFrList.join(", ");
          } else {
            reasonFr = "Admissible";
          }
        }
        parts.push(`(${id} : ${reasonFr})`);
      }
      metierRaison = parts.join(", ");
    }

    const reoNote = `Étape 1 (En cours) - Réorientation nécessaire car inadmissible pour : ${metierRaison}, courriel de réo envoyé, en attente de la réponse du postulant. Postulant averti de la fermeture de son dossier si aucune action n'est prise d'ici 30 jours.`;

    if (this.sharedState.includeLinkedEmail() && this.sharedState.taskNote()) {
      const taskNoteRaw = this.sharedState.taskNote();

      // Extrait le message médical s'il est présent
      let medicalSuffix = "";
      const medicalMarker = "MÉDICAL - TRIAGE PAR MED CHU REQUIS";
      if (taskNoteRaw.toUpperCase().includes(medicalMarker)) {
        medicalSuffix = "\n\nMÉDICAL - TRIAGE PAR MED CHU REQUIS";
      }

      // Normalise les notes en extrayant le préfixe et le suffixe commun
      const prefixRegex = /^Étape 1 \((En cours|en cours)\)\s*-\s*/i;
      const suffixString = "Postulant averti de la fermeture de son dossier si aucune action n'est prise d'ici 30 jours.";

      // Pour la note de tâche
      let taskHasPrefix = prefixRegex.test(taskNoteRaw);
      let taskClean = taskNoteRaw.replace(prefixRegex, "").trim();
      // On retire la partie médicale pour le nettoyage
      const medicalIndex = taskClean.toUpperCase().indexOf(medicalMarker);
      if (medicalIndex !== -1) {
        taskClean = taskClean.substring(0, medicalIndex).trim();
      }
      // On retire le suffixe de fermeture de dossier
      const suffixIndexTask = taskClean.toLowerCase().indexOf(suffixString.toLowerCase());
      if (suffixIndexTask !== -1) {
        taskClean = taskClean.substring(0, suffixIndexTask).trim();
      }
      if (taskClean.endsWith(".")) {
        taskClean = taskClean.slice(0, -1).trim();
      }

      // Pour la note de réorientation
      let reoHasPrefix = prefixRegex.test(reoNote);
      let reoClean = reoNote.replace(prefixRegex, "").trim();
      const suffixIndexReo = reoClean.toLowerCase().indexOf(suffixString.toLowerCase());
      if (suffixIndexReo !== -1) {
        reoClean = reoClean.substring(0, suffixIndexReo).trim();
      }
      if (reoClean.endsWith(".")) {
        reoClean = reoClean.slice(0, -1).trim();
      }

      // Combine les textes principaux
      let combinedCore = "";
      if (taskClean && reoClean) {
        if (taskClean === reoClean) {
          combinedCore = taskClean;
        } else {
          combinedCore = `${taskClean} ET ${reoClean}`;
        }
      } else {
        combinedCore = taskClean || reoClean;
      }

      // Restaure le préfixe si l'une des deux notes l'avait
      const hasPrefix = taskHasPrefix || reoHasPrefix;
      const finalPrefix = hasPrefix ? "Étape 1 (En cours) - " : "";

      return `${finalPrefix}${combinedCore}. ${suffixString}${medicalSuffix}`;
    }

    return reoNote;
  }

  async copyNoteRegistry() {
    try {
      const textContent = this.generateNoteRegistry();

      if (navigator.clipboard && navigator.clipboard.write) {
        const textBlob = new Blob([textContent], { type: "text/plain" });
        const clipboardItem = new ClipboardItem({
          "text/plain": textBlob,
        });
        await navigator.clipboard.write([clipboardItem]);
      } else {
        await navigator.clipboard.writeText(textContent);
      }

      this.noteCopied.set(true);
      setTimeout(() => this.noteCopied.set(false), 2000);
    } catch (err) {
      console.error("Failed to copy note", err);
    }
  }

  readonly JOB_URLS: { [key: string]: { fr: string; en: string } } = {
    "00005": {
      fr: "https://forces.ca/fr/carriere/arme-blindee/",
      en: "https://forces.ca/en/career/armour-soldier/",
    },
    "00010": {
      fr: "https://forces.ca/fr/carriere/fantassin/",
      en: "https://forces.ca/en/career/infanteer/",
    },
    "00019": {
      fr: "https://forces.ca/fr/carriere/operateur-detecteurs-electroniques-aeroportes/",
      en: "https://forces.ca/en/career/airborne-electronic-sensor-operator/",
    },
    "00099": {
      fr: "https://forces.ca/fr/carriere/specialiste-renseignement/",
      en: "https://forces.ca/en/career/intelligence-operator/",
    },
    "00100": {
      fr: "https://forces.ca/fr/carriere/technicien-meteorologie/",
      en: "https://forces.ca/en/career/meteorological-technician/",
    },
    "00105": {
      fr: "https://forces.ca/fr/carriere/manoeuvrier/",
      en: "https://forces.ca/en/career/boatswain/",
    },
    "00109": {
      fr: "https://forces.ca/fr/carriere/technicien-systemes-aerospatiales/",
      en: "https://forces.ca/en/career/aerospace-telecommunications-and-information-systems-technician/",
    },
    "00114": {
      fr: "https://forces.ca/fr/carriere/operateur-equipement-information-combat/",
      en: "https://forces.ca/en/career/naval-combat-information-operator/",
    },
    "00115": {
      fr: "https://forces.ca/fr/carriere/operateur-detecteurs-etectroniques/",
      en: "https://forces.ca/en/career/naval-electronic-sensor-operator/",
    },
    "00120": {
      fr: "https://forces.ca/fr/carriere/specialistes-du-renseignement-origine-electromagnetique/",
      en: "https://forces.ca/en/career/signals-intelligence-specialist/",
    },
    "00129": {
      fr: "https://forces.ca/fr/carriere/technicien-de-vehicule/",
      en: "https://forces.ca/en/career/vehicle-technician/",
    },
    "00130": {
      fr: "https://forces.ca/fr/carriere/technicien-armement/",
      en: "https://forces.ca/en/career/weapons-technician/",
    },
    "00134": {
      fr: "https://forces.ca/fr/carriere/technicien-materiaux/",
      en: "https://forces.ca/en/career/materials-technician/",
    },
    "00135": {
      fr: "https://forces.ca/fr/carriere/technicien-systemes-aeronautiques/",
      en: "https://forces.ca/en/career/aviation-systems-technician/",
    },
    "00136": {
      fr: "https://forces.ca/fr/carriere/technicien-systeme-avionique/",
      en: "https://forces.ca/en/career/avionics-systems-technician/",
    },
    "00137": {
      fr: "https://forces.ca/fr/carriere/technicien-imagerie/",
      en: "https://forces.ca/en/career/imagery-technician/",
    },
    "00138": {
      fr: "https://forces.ca/fr/carriere/technicien-structure-aeronefs/",
      en: "https://forces.ca/en/career/aircraft-structures-technician/",
    },
    "00149": {
      fr: "https://forces.ca/fr/carriere/pompier/",
      en: "https://forces.ca/en/career/firefighter/",
    },
    "00152": {
      fr: "https://forces.ca/fr/carriere/technologue-laboratoire-medical/",
      en: "https://forces.ca/en/career/medical-laboratory-technologist/",
    },
    "00153": {
      fr: "https://forces.ca/fr/carriere/technologue-radiologie-medicale/",
      en: "https://forces.ca/en/career/medical-radiation-technologist/",
    },
    "00155": {
      fr: "https://forces.ca/fr/carriere/technologue-electronique-biomedicale/",
      en: "https://forces.ca/en/career/biomedical-electronics-technologist/",
    },
    "00161": {
      fr: "https://forces.ca/fr/carriere/police-militaire/",
      en: "https://forces.ca/en/career/military-police/",
    },
    "00164": {
      fr: "https://forces.ca/fr/carriere/cuisinier/",
      en: "https://forces.ca/en/career/cook/",
    },
    "00166": {
      fr: "https://forces.ca/fr/carriere/musicien/",
      en: "https://forces.ca/en/career/musician/",
    },
    "00167": {
      fr: "https://forces.ca/fr/carriere/commis-postes/",
      en: "https://forces.ca/en/career/postal-clerk/",
    },
    "00168": {
      fr: "https://forces.ca/fr/carriere/technicien-gestion-materiel/",
      en: "https://forces.ca/en/career/materiel-management-technician/",
    },
    "00169": {
      fr: "https://forces.ca/fr/carriere/technicien-de-munitions/",
      en: "https://forces.ca/en/career/ammunition-technician/",
    },
    "00170": {
      fr: "https://forces.ca/fr/carriere/technicien-mouvements/",
      en: "https://forces.ca/en/career/traffic-technician/",
    },
    "00171": {
      fr: "https://forces.ca/fr/carriere/conducteur-materiel-mobile-soutien/",
      en: "https://forces.ca/en/career/mobile-support-equipment-operator/",
    },
    "00178": {
      fr: "https://forces.ca/fr/carriere/officier-blindes/",
      en: "https://forces.ca/en/career/armour-officer/",
    },
    "00179": {
      fr: "https://forces.ca/fr/carriere/officier-artillerie/",
      en: "https://forces.ca/en/career/artillery-officer/",
    },
    "00180": {
      fr: "https://forces.ca/fr/carriere/officier-infanterie/",
      en: "https://forces.ca/en/career/infantry-officer/",
    },
    "00181": {
      fr: "https://forces.ca/fr/carriere/officier-genie/",
      en: "https://forces.ca/en/career/engineer-officer/",
    },
    "00182": {
      fr: "https://forces.ca/fr/carriere/officier-systemes-combat/",
      en: "https://forces.ca/en/career/air-combat-systems-officer/",
    },
    "00183": {
      fr: "https://forces.ca/fr/carriere/pilote/",
      en: "https://forces.ca/en/career/pilot/",
    },
    "00184": {
      fr: "https://forces.ca/fr/carriere/officier-controle-aerospatial/",
      en: "https://forces.ca/en/career/aerospace-control-officer/",
    },
    "00185": {
      fr: "https://forces.ca/fr/carriere/officier-genie-aerospatial/",
      en: "https://forces.ca/en/career/aerospace-engineering-officer/",
    },
    "00187": {
      fr: "https://forces.ca/fr/carriere/officier-genie-electrique-mecanique/",
      en: "https://forces.ca/en/career/electrical-and-mechanical-engineering-officer/",
    },
    "00189": {
      fr: "https://forces.ca/fr/carriere/officier-genie-construction/",
      en: "https://forces.ca/en/career/construction-engineering-officer/",
    },
    "00190": {
      fr: "https://forces.ca/fr/carriere/officier-physiotherapie/",
      en: "https://forces.ca/en/career/physiotherapy-officer/",
    },
    "00191": {
      fr: "https://forces.ca/fr/carriere/dentiste-militaire/",
      en: "https://forces.ca/en/career/dental-officer/",
    },
    "00194": {
      fr: "https://forces.ca/fr/carriere/pharmacien/",
      en: "https://forces.ca/en/career/pharmacy-officer/",
    },
    "00195": {
      fr: "https://forces.ca/fr/carriere/soins-infirmiers/",
      en: "https://forces.ca/en/career/nursing-officer/",
    },
    "00197": {
      fr: "https://forces.ca/fr/carriere/officier-sciences-biologiques/",
      en: "https://forces.ca/en/career/bioscience-officer/",
    },
    "00198": {
      fr: "https://forces.ca/fr/carriere/travail-social/",
      en: "https://forces.ca/en/career/social-work-officer/",
    },
    "00203": {
      fr: "https://forces.ca/fr/carriere/officier-affaires-publiques/",
      en: "https://forces.ca/en/career/public-affairs-officer/",
    },
    "00204": {
      fr: "https://forces.ca/fr/carriere/avocat/",
      en: "https://forces.ca/en/career/legal-officer/",
    },
    "00207": {
      fr: "https://forces.ca/fr/carriere/officier-guerre-navale/",
      en: "https://forces.ca/en/career/naval-warfare-officer/",
    },
    "00208": {
      fr: "https://forces.ca/fr/carriere/officier-selection-personnel/",
      en: "https://forces.ca/en/career/personnel-selection-officer/",
    },
    "00211": {
      fr: "https://forces.ca/fr/carriere/officier-developpement-instruction/",
      en: "https://forces.ca/en/career/training-development-officer/",
    },
    "00213": {
      fr: "https://forces.ca/fr/carriere/officier-renseignement/",
      en: "https://forces.ca/en/career/intelligence-officer/",
    },
    "00214": {
      fr: "https://forces.ca/fr/carriere/officier-police-militaire/",
      en: "https://forces.ca/en/career/military-police-officer/",
    },
    "00238": {
      fr: "https://forces.ca/fr/carriere/technicien-geomatique/",
      en: "https://forces.ca/en/career/geomatics-technician/",
    },
    "00261": {
      fr: "https://forces.ca/fr/carriere/technicien-systemes-armement/",
      en: "https://forces.ca/en/career/air-weapons-systems-technician/",
    },
    "00299": {
      fr: "https://forces.ca/fr/carriere/specialiste-communication-navales/",
      en: "https://forces.ca/en/career/naval-communicator/",
    },
    "00301": {
      fr: "https://forces.ca/fr/carriere/technicien-en-refrigeration-et-mecanique/",
      en: "https://forces.ca/en/career/refrigeration-and-mechanical-technician/",
    },
    "00302": {
      fr: "https://forces.ca/fr/carriere/technicien-distribution-electrique/",
      en: "https://forces.ca/en/career/electrical-distribution-technician/",
    },
    "00303": {
      fr: "https://forces.ca/fr/carriere/technicien-des-groupes-electrogenes/",
      en: "https://forces.ca/en/career/electrical-generation-systems-technician/",
    },
    "00304": {
      fr: "https://forces.ca/fr/carriere/technicien-plomberie-chauffage/",
      en: "https://forces.ca/en/career/plumbing-heat-technician/",
    },
    "00305": {
      fr: "https://forces.ca/fr/carriere/technicien-eau-produits-petroliers-environnement/",
      en: "https://forces.ca/en/career/water-fuels-and-environment-technician/",
    },
    "00306": {
      fr: "https://forces.ca/fr/carriere/technicien-construction/",
      en: "https://forces.ca/en/career/construction-technician/",
    },
    "00324": {
      fr: "https://forces.ca/fr/carriere/operateur-sonar/",
      en: "https://forces.ca/en/career/sonar-operator/",
    },
    "00327": {
      fr: "https://forces.ca/fr/carriere/technicien-elec-opto/",
      en: "https://forces.ca/en/career/electronic-optronic-technician/",
    },
    "00328": {
      fr: "https://forces.ca/fr/carriere/officier-logistique/",
      en: "https://forces.ca/en/career/logistics-officer/",
    },
    "00335": {
      fr: "https://forces.ca/fr/carriere/technicien-dentaire/",
      en: "https://forces.ca/en/career/dental-technician/",
    },
    "00337": {
      fr: "https://forces.ca/fr/carriere/operateur-controle-aerospatial/",
      en: "https://forces.ca/en/career/aerospace-control-operator/",
    },
    "00339": {
      fr: "https://forces.ca/fr/carriere/sapeur-combat/",
      en: "https://forces.ca/en/career/combat-engineer/",
    },
    "00340": {
      fr: "https://forces.ca/fr/carriere/officier-genie-electronique-communications/",
      en: "https://forces.ca/en/career/communication-and-electronics-engineering-officer/",
    },
    "00341": {
      fr: "https://forces.ca/fr/carriere/officier-transmissions/",
      en: "https://forces.ca/en/career/signals-officer/",
    },
    "00344": {
      fr: "https://forces.ca/fr/carriere/officier-genie-systemes-combat-maritime/",
      en: "https://forces.ca/en/career/naval-combat-systems-engineering-officer/",
    },
    "00345": {
      fr: "https://forces.ca/fr/carriere/officier-genie-systemes-marine/",
      en: "https://forces.ca/en/career/marine-systems-engineering-officer/",
    },
    "00349": {
      fr: "https://forces.ca/fr/carriere/aumonier/",
      en: "https://forces.ca/en/career/chaplain/",
    },
    "00366": {
      fr: "https://forces.ca/fr/carriere/technicien-genie-armes/",
      en: "https://forces.ca/en/career/weapons-engineering-technician/",
    },
    "00368": {
      fr: "https://forces.ca/fr/carriere/artilleur/",
      en: "https://forces.ca/en/career/gunner/",
    },
    "00370": {
      fr: "https://forces.ca/fr/carriere/technicien-dessin-arpentage/",
      en: "https://forces.ca/en/career/drafting-and-survey-technician/",
    },
    "00372": {
      fr: "https://forces.ca/fr/carriere/technicien-bloc-operatoire/",
      en: "https://forces.ca/en/career/operating-room-technician/",
    },
    "00374": {
      fr: "https://forces.ca/fr/carriere/adjoint-au-medecin/",
      en: "https://forces.ca/en/career/physician-assistant/",
    },
    "00375": {
      fr: "https://forces.ca/fr/carriere/administrateur-ressources-humaines/",
      en: "https://forces.ca/en/career/human-resources-administrator/",
    },
    "00376": {
      fr: "https://forces.ca/fr/carriere/administrateur-services-financiers/",
      en: "https://forces.ca/en/career/financial-services-administrator/",
    },
    "00378": {
      fr: "https://forces.ca/fr/carriere/cyber-operateur/",
      en: "https://forces.ca/en/career/cyber-operator/",
    },
    "00383": {
      fr: "https://forces.ca/fr/carriere/operateur-des-transmissions/",
      en: "https://forces.ca/en/career/signal-operator/",
    },
    "00384": {
      fr: "https://forces.ca/fr/carriere/technicien-des-lignes/",
      en: "https://forces.ca/en/career/line-technician/",
    },
    "00385": {
      fr: "https://forces.ca/fr/carriere/technicien-des-transmissions/",
      en: "https://forces.ca/en/career/signal-technician/",
    },
    "00386": {
      fr: "https://forces.ca/fr/carriere/techniciens-de-soutien-des-operations-aeriennes/",
      en: "https://forces.ca/en/career/air-operations-support-technician/",
    },
    "00387": {
      fr: "https://forces.ca/fr/carriere/Technicien-des-Systemes-de-Largage/",
      en: "https://forces.ca/en/career/air-drop-systems-technician/",
    },
    "00389": {
      fr: "https://forces.ca/fr/carriere/Officier-des-operations-aeriennes/",
      en: "https://forces.ca/en/career/Air-Operations-Officer/",
    },
    "00390": {
      fr: "https://forces.ca/fr/carriere/specialiste-en-medecine-interne/",
      en: "https://forces.ca/en/career/internal-medicine-specialist/",
    },
    "00393": {
      fr: "https://forces.ca/fr/carriere/medecin/",
      en: "https://forces.ca/en/career/medical-officer/",
    },
    "00394": {
      fr: "https://forces.ca/fr/carriere/technicien-en-systemes-information/",
      en: "https://forces.ca/en/career/information-systems-technician/",
    },
    "00398": {
      fr: "https://forces.ca/fr/carriere/officier-gestion-services-sante/",
      en: "https://forces.ca/en/career/health-services-management-officer/",
    },
    "00402": {
      fr: "https://forces.ca/fr/programme-experience-de-la-marine/",
      en: "https://forces.ca/en/naval-experience-program/?slug=nep",
    },
    "00404": {
      fr: "https://forces.ca/fr/carriere/technicien-electricite-systemes/",
      en: "https://forces.ca/en/career/marine-systems-electrical-technician/",
    },
    "00405": {
      fr: "https://forces.ca/fr/carriere/technicien-mecanique-systemes/",
      en: "https://forces.ca/en/career/marine-systems-mechanical-technician/",
    },
    "00406": {
      fr: "https://forces.ca/fr/carriere/paramedicaux/",
      en: "https://forces.ca/en/career/paramedic/",
    },
    "00407": {
      fr: "https://forces.ca/fr/carriere/personnel-medical-au-combat/",
      en: "https://forces.ca/en/career/combat-medic/",
    },
  };

  getJobLinkMarkup(jobId: string, isFrench: boolean, isHtml: boolean): string {
    const job = this.jobService.getAllJobs().find((j) => j.id === jobId);
    const urlInfo = this.JOB_URLS[jobId];

    let titleText = jobId;
    if (job) {
      titleText = job.title;
      if (!isFrench && urlInfo) {
        let slug =
          urlInfo.en.split("/career/")[1] ||
          urlInfo.en.split(".ca/en/")[1] ||
          "";
        slug = slug
          .replace(/\//g, "")
          .replace(/\?slug=nep/, "")
          .replace(/-/g, " ");
        if (slug) {
          titleText = slug
            .split(" ")
            .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
            .join(" ");
        } else if (job.titleEn) {
          titleText = job.titleEn;
        }
      } else if (!isFrench && job.titleEn) {
        titleText = job.titleEn;
      }
    }

    if (urlInfo) {
      const url = isFrench ? urlInfo.fr : urlInfo.en;
      if (isHtml) {
        return `<a href="${url}" target="_blank" class="text-blue-600 hover:underline hover:text-blue-800" style="color: #2563eb; text-decoration: underline;">${titleText}</a>`;
      } else {
        return `${titleText} (${url})`;
      }
    }
    return titleText;
  }

  buildBilingualEmail(isHtml: boolean): string {
    const jobIds = this.eligibleJobs();
    if (jobIds.length === 0) {
      if (isHtml) {
        return '<p class="text-slate-500 italic text-center mt-10">Sélectionnez au moins un critère de scolarité ou d\'expérience pour évaluer les métiers admissibles et générer le courriel de réorientation.</p>';
      } else {
        return "Sélectionnez au moins un critère de scolarité ou d'expérience pour générer le courriel.";
      }
    }

    const dossierIds = [
      this.selectedDossierJobId1(),
      this.selectedDossierJobId2(),
      this.selectedDossierJobId3(),
    ].filter((id) => !!id);

    const hasNoJobCode = dossierIds.includes("00003");
    const realDossierIds = dossierIds.filter((id) => id !== "00003");

    // Determine if the *only* reason is that the dossier jobs are closed in SIP
    let isOnlyClosedJobsReason = dossierIds.length > 0;
    for (const id of dossierIds) {
      const s = this.evaluateJobAdmissibility(id);
      if (s) {
        if (
          !s.isJobClosed ||
          !s.isAgeAdmissible ||
          !s.isCitizenshipAdmissible ||
          !s.isEducationAdmissible
        ) {
          isOnlyClosedJobsReason = false;
          break;
        }
      }
    }

    // Split eligible jobs into NCM and Officer
    const OFFICER_JOB_IDS = new Set([
      "00178",
      "00179",
      "00180",
      "00181",
      "00182",
      "00183",
      "00184",
      "00185",
      "00187",
      "00189",
      "00190",
      "00191",
      "00194",
      "00195",
      "00197",
      "00198",
      "00203",
      "00208",
      "00211",
      "00328",
      "00345",
      "00349",
      "00374",
      "00389",
      "00390",
      "00393",
      "00398",
      "00204",
      "00207",
      "00213",
      "00214",
      "00340",
      "00341",
      "00344",
    ]);

    const listNCM: string[] = [];
    const listOFF: string[] = [];
    for (const jId of jobIds) {
      if (OFFICER_JOB_IDS.has(jId)) {
        listOFF.push(jId);
      } else {
        listNCM.push(jId);
      }
    }

    const rawHtml = this.sharedState.taskEmailHtmlFr();
    const rawTxt = this.sharedState.taskEmailFr();
    const hasTasks =
      !!rawHtml &&
      this.sharedState.hasReassignedTasks() &&
      rawHtml.includes("Bonjour,");
    const mergeTasks = this.sharedState.includeLinkedEmail() && hasTasks;

    if (isHtml) {
      // ------------------ HTML VERSION ------------------
      let h = "";

      // Top notice
      h +=
        '<p><span style="background-color: yellow; font-weight: bold; padding: 2px 4px; border-radius: 3px;">English message will follow.</span></p>\n';

      // FRENCH SECTION
      h += '<p class="mt-4">Bonjour,</p>\n';

      if (mergeTasks) {
        // Unified smart intro explaining both tasks list and reorientation
        h +=
          "<p class=\"mt-4\">Suite à l'analyse de votre dossier de candidature, nous constatons que certaines actions de votre part sont requises pour nous permettre de poursuivre le traitement de votre demande. En effet, vous devez à la fois <strong>apporter des corrections aux tâches qui vous ont été réattribuées</strong> sur votre portail et faire l'objet d'une <strong>réorientation pour vos choix de métiers</strong>.</p>\n";

        // Extract tasks list body from standard task email html
        let taskPartHtml = "";
        const frParts = rawHtml.split("<p>Bonjour,</p>");
        if (frParts.length > 1) {
          const frBodyPart = frParts[1].split("<p>En raison du volume");
          if (frBodyPart.length > 0 && frBodyPart[0].trim().length > 0) {
            taskPartHtml = frBodyPart[0].trim();
          }
        }

        if (taskPartHtml) {
          h +=
            '<div class="mt-4 p-4 bg-amber-50/50 border border-amber-200 rounded-lg text-sm">\n';
          h +=
            '<p class="font-bold text-amber-800 border-b border-amber-200 pb-1 mb-2">1. TÂCHES ET COMMUNICATIONS À CORRIGER SUR VOTRE PORTAIL :</p>\n';
          h += taskPartHtml + "\n";
          h += "</div>\n";
        }

        h +=
          '<p class="mt-6 font-bold text-slate-800 border-b border-slate-200 pb-1 mb-2">2. STATUT DE VOS CHOIX DE MÉTIERS ACTUELS ET LOGIQUE DE RÉORIENTATION :</p>\n';
      } else {
        // Standard Reorientation Intro French
        if (hasNoJobCode) {
          h +=
            "<p class=\"mt-4\">Suite à l'analyse de votre dossier de candidature, nous constatons que vous devez faire l'objet d'une réorientation. En effet, aucun métier n'est actuellement sélectionné à votre dossier et le traitement de votre demande ne peut pas se poursuivre sans qu'un choix de métier ne soit fait de votre part.</p>\n";
        }
      }

      if (realDossierIds.length > 0) {
        if (!hasNoJobCode) {
          h +=
            "<p class=\"mt-4\">Suite à l'analyse de votre dossier de candidature, nous constatons que vous devez faire l'objet d'une réorientation. En effet, voici le statut des métiers actuellement inscrits à votre dossier :</p>\n";
        } else {
          h +=
            '<p class="mt-4">Voici le statut des autres métiers inscrits à votre dossier :</p>\n';
        }
        h += '<ul class="list-disc pl-5 mt-2 mb-4">\n';
        for (const id of realDossierIds) {
          const name = `${id} - ${this.getJobLinkMarkup(id, true, true)}`;
          const s = this.evaluateJobAdmissibility(id);
          let reasonFr = "";
          if (s) {
            const reasonsFrList: string[] = [];
            if (s.isJobClosed) {
              reasonsFrList.push(
                "Il n'y a plus de postes disponibles pour ce métier.",
              );
            }
            if (!s.isAgeAdmissible) {
              reasonsFrList.push(
                `Votre âge actuel ne vous permet pas de compléter le contrat initial du métier (${s.durationYears} ans) avant l'âge de 60 ans.`,
              );
            }
            if (!s.isCitizenshipAdmissible) {
              reasonsFrList.push(
                "Pour diverses raisons, ce métier n'est pas accessible aux résidents permanents.",
              );
            }
            if (!s.isEducationAdmissible) {
              reasonsFrList.push(
                "Votre scolarité ou votre expérience ne satisfait pas aux exigences minimales.",
              );
            }

            if (reasonsFrList.length > 0) {
              reasonFr = `\n    <ul class="list-disc pl-5 mt-1 text-sm text-slate-600">\n      <li>${reasonsFrList.join("</li>\n      <li>")}</li>\n    </ul>`;
            } else {
              reasonFr =
                " : Admissible (réorientation lancée pour d'autres éléments du dossier).";
            }
          }
          h += `  <li class="mt-1"><strong>${name}</strong>${reasonFr}</li>\n`;
        }
        h += "</ul>\n";
      } else if (!hasNoJobCode) {
        h +=
          "<p class=\"mt-4\">Suite à l'analyse de votre dossier de candidature, nous constatons que vos choix de métiers actuels ne sont pas disponibles ou que vous n'y êtes pas admissible d'après nos critères.</p>\n";
      }

      // Options French
      h +=
        '<p class="mt-4 font-semibold text-slate-800">Voici les options qui s\'offrent à vous :</p>\n';
      if (isOnlyClosedJobsReason) {
        h +=
          '<p class="mt-2 text-sm"><strong>Option 1 : Conserver vos choix de métier actuels et attendre leur réouverture</strong><br>Vous pouvez choisir de garder vos choix de métier actuels et de patienter jusqu\'en avril prochain pour la réouverture des positions. Si vous sélectionnez cette option, <strong>votre dossier de candidature actuel sera fermé</strong> et il sera de votre entière responsabilité de nous recontacter vers la fin du mois de mars prochain pour réactiver votre processus.</p>\n';
        h +=
          '<p class="mt-4 text-sm"><strong>Option 2 : Choisir un autre métier parmi la liste des métiers admissibles</strong><br>Vous pouvez réorienter votre candidature vers d\'autres choix de métiers admissibles dès maintenant. Consultez la liste ci-dessous.</p>\n';
      } else {
        h +=
          '<p class="mt-2 text-sm"><strong>Choisir un autre métier parmi la liste des métiers admissibles</strong><br>Vous devez réorienter votre candidature vers un choix de métier pour lequel vous êtes admissible afin de poursuivre le processus d\'enrôlement. Veuillez consulter la liste ci-dessous.</p>\n';
      }

      // Eligible Jobs French Division
      h +=
        '<div class="mt-4 p-4 bg-slate-50 border border-slate-200 rounded-lg text-sm">\n';
      h +=
        '<p class="font-bold text-slate-800 border-b border-slate-200 pb-1 mb-2">MÉTIERS ADMISSIBLES :</p>\n';

      // NCM
      if (listNCM.length > 0) {
        h +=
          '<p class="font-bold text-blue-800 mt-2">Militaires du rang :</p>\n';
        h += '<ul class="list-disc pl-5 mt-1 mb-2">\n';
        for (const jId of listNCM) {
          h += `  <li class="mt-0.5"><strong>${jId} - ${this.getJobLinkMarkup(jId, true, true)}</strong></li>\n`;
        }
        h += "</ul>\n";

        const proofsMap = new Map<string, string[]>();
        for (const jId of listNCM) {
          const missing = this.getMissingProofs(jId);
          if (missing.fr.length > 0) {
            proofsMap.set(jId, missing.fr);
          }
        }
        if (proofsMap.size > 0) {
          h +=
            '<p class="mt-2 text-xs text-red-800 font-semibold font-sans">Vous devrez fournir ces documents/preuves supplémentaires si vous choisissez les métiers suivants :</p>\n';
          h += '<ul class="list-disc pl-5 mt-1 mb-2 text-xs text-slate-600">\n';
          for (const [jId, proofs] of proofsMap.entries()) {
            h +=
              `  <li class="mt-0.5"><strong>Pour ${jId} - ${this.getJobLinkMarkup(jId, true, true)} :</strong> ` +
              proofs.join(", ") +
              "</li>\n";
          }
          h += "</ul>\n";
        }
      }

      // Officers
      if (listOFF.length > 0) {
        h += '<p class="font-bold text-purple-800 mt-4">Officiers :</p>\n';
        h += '<ul class="list-disc pl-5 mt-1 mb-2">\n';
        for (const jId of listOFF) {
          h += `  <li class="mt-0.5"><strong>${jId} - ${this.getJobLinkMarkup(jId, true, true)}</strong></li>\n`;
        }
        h += "</ul>\n";

        const proofsMap = new Map<string, string[]>();
        for (const jId of listOFF) {
          const missing = this.getMissingProofs(jId);
          if (missing.fr.length > 0) {
            proofsMap.set(jId, missing.fr);
          }
        }
        if (proofsMap.size > 0) {
          h +=
            '<p class="mt-2 text-xs text-red-800 font-semibold font-sans">Vous devrez fournir ces documents/preuves supplémentaires si vous choisissez les métiers suivants :</p>\n';
          h += '<ul class="list-disc pl-5 mt-1 mb-2 text-xs text-slate-600">\n';
          for (const [jId, proofs] of proofsMap.entries()) {
            h +=
              `  <li class="mt-0.5"><strong>Pour ${jId} - ${this.getJobLinkMarkup(jId, true, true)} :</strong> ` +
              proofs.join(", ") +
              "</li>\n";
          }
          h += "</ul>\n";
        }
      }
      h += "</div>\n";

      // Conclusion French
      if (mergeTasks) {
        h +=
          '<p class="mt-6 font-semibold text-slate-800">Prochaines étapes :</p>\n';
        h +=
          "<p>En raison du volume élevé de candidatures, nous devons prioriser le traitement des dossiers dont toutes les tâches sont complétées. Nous vous invitons donc à :</p>\n";
        h += '<ul class="list-disc pl-5 mt-1 mb-2 text-sm text-slate-700">\n';
        h +=
          '  <li>Vous rendre sur votre portail (<a href="https://www.cafoap-pclfac.forces.gc.ca/" class="text-blue-600 hover:underline">https://www.cafoap-pclfac.forces.gc.ca/</a>) afin de corriger sans délai les tâches indiquées ci-dessus ;</li>\n';
        h +=
          "  <li>Répondre directement à ce courriel avec votre choix de réorientation ou vos nouveaux choix de métiers pour mettre à jour votre dossier.</li>\n";
        h += "</ul>\n";
      } else {
        h +=
          '<p class="mt-4">Nous vous remercions pour votre intérêt envers les Forces armées canadiennes. Veuillez nous faire part de votre décision en répondant directement à ce courriel afin de poursuivre ou de mettre à jour votre dossier.</p>\n';
      }

      // Warning French
      h +=
        '<p class="mt-4 text-sm text-slate-600">Si vous ne prenez aucune action, votre dossier sera désactivé automatiquement après 30 jours.</p>\n';

      // Signature French
      h += '<p>' + this.sharedState.getHtmlSignatureFr() + '</p>\n';

      // Divider
      h += '<hr class="my-6 border-slate-200" />\n';

      // ======================================
      // ENGLISH SECTION
      // ======================================
      h += '<p class="mt-4">Hello,</p>\n';

      if (mergeTasks) {
        // Unified smart English intro
        h +=
          '<p class="mt-4">Following the analysis of your application file, we have determined that actions are required on your part to proceed with processing your application. Specifically, you must <strong>correct the reassigned tasks</strong> on your portal and undergo a <strong>reorientation of your occupational choices</strong>.</p>\n';

        let taskPartHtmlEn = "";
        const enParts = rawHtml.split("<p>Hello,</p>");
        if (enParts.length > 1) {
          const enBodyPart = enParts[1].split("<p>Due to the high volume");
          if (enBodyPart.length > 0 && enBodyPart[0].trim().length > 0) {
            taskPartHtmlEn = enBodyPart[0].trim();
          }
        }

        if (taskPartHtmlEn) {
          h +=
            '<div class="mt-4 p-4 bg-amber-50/50 border border-amber-200 rounded-lg text-sm">\n';
          h +=
            '<p class="font-bold text-amber-800 border-b border-amber-200 pb-1 mb-2">1. TASKS AND COMMUNICATIONS TO CORRECT ON YOUR PORTAL :</p>\n';
          h += taskPartHtmlEn + "\n";
          h += "</div>\n";
        }

        h +=
          '<p class="mt-6 font-bold text-slate-800 border-b border-slate-200 pb-1 mb-2">2. STATUS OF YOUR CURRENT OCCUPATIONS AND REORIENTATION LOGIC :</p>\n';
      } else {
        // Standard English intro
        if (hasNoJobCode) {
          h +=
            '<p class="mt-4">Following the analysis of your application file, we have determined that you must undergo a reorientation. Indeed, no occupation is currently selected in your file, and the processing of your application cannot continue without an occupation choice from you.</p>\n';
        }
      }

      if (realDossierIds.length > 0) {
        if (!hasNoJobCode) {
          h +=
            '<p class="mt-4">Following the analysis of your application file, we have determined that you must undergo a reorientation. Here is the current status of the occupations in your file:</p>\n';
        } else {
          h +=
            '<p class="mt-4">Here is the current status of the other occupations in your file:</p>\n';
        }
        h += '<ul class="list-disc pl-5 mt-2 mb-4">\n';
        for (const id of realDossierIds) {
          const nameEn = `${id} - ${this.getJobLinkMarkup(id, false, true)}`;
          const s = this.evaluateJobAdmissibility(id);
          let reasonEn = "";
          if (s) {
            const reasonsEnList: string[] = [];
            if (s.isJobClosed) {
              reasonsEnList.push(
                "There are no longer positions available for this occupation.",
              );
            }
            if (!s.isAgeAdmissible) {
              reasonsEnList.push(
                `Your current age does not allow you to complete the initial contract length for this occupation (${s.durationYears} years) before reaching age 60.`,
              );
            }
            if (!s.isCitizenshipAdmissible) {
              reasonsEnList.push(
                "For various reasons, this occupation is not accessible to permanent residents.",
              );
            }
            if (!s.isEducationAdmissible) {
              reasonsEnList.push(
                "Your academic level or experience does not meet the minimum requirements.",
              );
            }

            if (reasonsEnList.length > 0) {
              reasonEn = `\n    <ul class="list-disc pl-5 mt-1 text-sm text-slate-600">\n      <li>${reasonsEnList.join("</li>\n      <li>")}</li>\n    </ul>`;
            } else {
              reasonEn =
                ": Admissible (reorientation initiated due to other elements of your file).";
            }
          }
          h += `  <li class="mt-1"><strong>${nameEn}</strong>${reasonEn}</li>\n`;
        }
        h += "</ul>\n";
      } else if (!hasNoJobCode) {
        h +=
          '<p class="mt-4">Following the analysis of your application file, we have determined that your current occupational choices are currently unavailable or you do not qualify for them based on our criteria.</p>\n';
      }

      // Options English
      h +=
        '<p class="mt-4 font-semibold text-slate-800">Here are the options available to you:</p>\n';
      if (isOnlyClosedJobsReason) {
        h +=
          '<p class="mt-2 text-sm"><strong>Option 1: Retain your current occupational choices and wait for their reopening</strong><br>You can choose to keep your current choices and wait until next April for the reopening of recruiting positions. If you select this option, <strong>your current application file will be closed</strong> and it will be your sole responsibility to contact us towards the end of next March to reactivate your process.</p>\n';
        h +=
          '<p class="mt-4 text-sm"><strong>Option 2: Choose another occupation from the list of eligible occupations</strong><br>You can redirect your application to other eligible occupational choices right now. Please consult the list below.</p>\n';
      } else {
        h +=
          '<p class="mt-2 text-sm"><strong>Choose another occupation from the list of eligible occupations</strong><br>You must redirect your application to an occupational choice for which you are eligible to continue the enrollment process. Please consult the list below.</p>\n';
      }

      // Eligible Jobs English Division
      h +=
        '<div class="mt-4 p-4 bg-slate-50 border border-slate-200 rounded-lg text-sm">\n';
      h +=
        '<p class="font-bold text-slate-800 border-b border-slate-200 pb-1 mb-2">ELIGIBLE OCCUPATIONS:</p>\n';

      // NCM English
      if (listNCM.length > 0) {
        h +=
          '<p class="font-bold text-blue-800 mt-2">Non-Commissioned Members (NCM):</p>\n';
        h += '<ul class="list-disc pl-5 mt-1 mb-2">\n';
        for (const jId of listNCM) {
          h += `  <li class="mt-0.5"><strong>${jId} - ${this.getJobLinkMarkup(jId, false, true)}</strong></li>\n`;
        }
        h += "</ul>\n";

        const proofsMapEn = new Map<string, string[]>();
        for (const jId of listNCM) {
          const missing = this.getMissingProofs(jId);
          if (missing.en.length > 0) {
            proofsMapEn.set(jId, missing.en);
          }
        }
        if (proofsMapEn.size > 0) {
          h +=
            '<p class="mt-2 text-xs text-red-800 font-semibold font-sans">You will need to provide these additional documents/proofs if you choose the following occupations:</p>\n';
          h += '<ul class="list-disc pl-5 mt-1 mb-2 text-xs text-slate-600">\n';
          for (const [jId, proofs] of proofsMapEn.entries()) {
            h +=
              `  <li class="mt-0.5"><strong>For ${jId} - ${this.getJobLinkMarkup(jId, false, true)}:</strong> ` +
              proofs.join(", ") +
              "</li>\n";
          }
          h += "</ul>\n";
        }
      }

      // Officers English
      if (listOFF.length > 0) {
        h += '<p class="font-bold text-purple-800 mt-4">Officers:</p>\n';
        h += '<ul class="list-disc pl-5 mt-1 mb-2">\n';
        for (const jId of listOFF) {
          h += `  <li class="mt-0.5"><strong>${jId} - ${this.getJobLinkMarkup(jId, false, true)}</strong></li>\n`;
        }
        h += "</ul>\n";

        const proofsMapEn = new Map<string, string[]>();
        for (const jId of listOFF) {
          const missing = this.getMissingProofs(jId);
          if (missing.en.length > 0) {
            proofsMapEn.set(jId, missing.en);
          }
        }
        if (proofsMapEn.size > 0) {
          h +=
            '<p class="mt-2 text-xs text-red-800 font-semibold font-sans">You will need to provide these additional documents/proofs if you choose the following occupations:</p>\n';
          h += '<ul class="list-disc pl-5 mt-1 mb-2 text-xs text-slate-600">\n';
          for (const [jId, proofs] of proofsMapEn.entries()) {
            h +=
              `  <li class="mt-0.5"><strong>For ${jId} - ${this.getJobLinkMarkup(jId, false, true)}:</strong> ` +
              proofs.join(", ") +
              "</li>\n";
          }
          h += "</ul>\n";
        }
      }
      h += "</div>\n";

      // Conclusion English
      h +=
        '<p class="mt-4">We thank you for your interest in the Canadian Armed Forces. Please let us know your decision by replying directly to this email so that we can update your file.</p>\n';

      // Warning English
      h +=
        '<p class="mt-4 text-sm text-slate-600">If you do not take any action, your file will be automatically deactivated after 30 days.</p>\n';

      // Signature English
      h += '<p>' + this.sharedState.getHtmlSignatureEn() + '</p>\n';

      return h;
    } else {
      // ------------------ PLAIN TEXT VERSION ------------------
      let p = "";
      p += "English message will follow.\n\n";
      p += "Bonjour,\n\n";

      if (this.sharedState.includeLinkedEmail()) {
        const tasksTxt = this.sharedState.taskEmailFr();
        const frParts = tasksTxt.split("Bonjour,");
        if (frParts.length > 1) {
          const frBodyPart = frParts[1].split("\n\nEn raison du volume");
          if (frBodyPart.length > 0 && frBodyPart[0].trim().length > 0) {
            p += frBodyPart[0].trim() + "\n\n";
          }
        }
      }

      // Intro French
      if (hasNoJobCode) {
        p +=
          "Suite à l'analyse de votre dossier de candidature, nous constatons que vous devez faire l'objet d'une réorientation. En effet, aucun métier n'est actuellement sélectionné à votre dossier et le traitement de votre demande ne peut pas se poursuivre sans qu'un choix de métier ne soit fait de votre part.\n\n";
      }

      if (realDossierIds.length > 0) {
        if (!hasNoJobCode) {
          p +=
            "Suite à l'analyse de votre dossier de candidature, nous constatons que vous devez faire l'objet d'une réorientation. En effet, voici le statut des métiers actuellement inscrits à votre dossier :\n";
        } else {
          p +=
            "Voici le statut des autres métiers inscrits à votre dossier :\n";
        }
        for (const id of realDossierIds) {
          const name = `${id} - ${this.getJobLinkMarkup(id, true, false)}`;
          const s = this.evaluateJobAdmissibility(id);
          let reasonFr = "";
          if (s) {
            const reasonsFrList: string[] = [];
            if (s.isJobClosed) {
              reasonsFrList.push(
                "Il n'y a plus de postes disponibles pour ce métier.",
              );
            }
            if (!s.isAgeAdmissible) {
              reasonsFrList.push(
                `Votre âge actuel ne vous permet pas de compléter le contrat initial du métier (${s.durationYears} ans) avant l'âge de 60 ans.`,
              );
            }
            if (!s.isCitizenshipAdmissible) {
              reasonsFrList.push(
                "Pour diverses raisons, ce métier n'est pas accessible aux résidents permanents.",
              );
            }
            if (!s.isEducationAdmissible) {
              reasonsFrList.push(
                "Votre scolarité ou votre expérience ne satisfait pas aux exigences minimales.",
              );
            }

            if (reasonsFrList.length > 0) {
              reasonFr = `\n    - ${reasonsFrList.join("\n    - ")}`;
            } else {
              reasonFr =
                " : Admissible (réorientation initiée pour d'autres éléments).";
            }
          }
          p += `- ${name}${reasonFr}\n`;
        }
        p += "\n";
      } else if (!hasNoJobCode) {
        p +=
          "Suite à l'analyse de votre dossier de candidature, nous constatons que vos choix de métiers actuels ne sont pas disponibles ou que vous n'y êtes pas admissible.\n\n";
      }

      // Options French
      p += "Voici les options qui s'offrent à vous :\n\n";
      if (isOnlyClosedJobsReason) {
        p +=
          "Option 1 : Conserver vos choix de métier actuels et attendre leur réouverture\n";
        p +=
          "Vous pouvez choisir de garder vos choix de métier actuels et de patienter jusqu'en avril prochain pour la réouverture des positions. Si vous sélectionnez cette option, votre dossier de candidature actuel sera fermé et il sera de votre entière responsabilité de nous recontacter vers la fin du mois de mars prochain pour réactiver votre processus.\n\n";
        p +=
          "Option 2 : Choisir un autre métier parmi la liste des métiers admissibles\n";
        p +=
          "Vous pouvez réorienter votre candidature vers d'autres choix de métiers admissibles dès maintenant. Consultez la liste ci-dessous.\n\n";
      } else {
        p += "Choisir un autre métier parmi la liste des métiers admissibles\n";
        p +=
          "Vous devez réorienter votre candidature vers un choix de métier pour lequel vous êtes admissible afin de poursuivre le processus d'enrôlement. Veuillez consulter la liste ci-dessous.\n\n";
      }

      // Eligible Jobs French Division
      p += "--------------------------------------------------\n";
      p += "MÉTIERS ADMISSIBLES :\n";
      p += "--------------------------------------------------\n\n";

      // NCM
      if (listNCM.length > 0) {
        p += "Militaires du rang :\n";
        for (const jId of listNCM) {
          p += `- ${jId} - ${this.getJobLinkMarkup(jId, true, false)}\n`;
        }
        p += "\n";

        const proofsMap = new Map<string, string[]>();
        for (const jId of listNCM) {
          const missing = this.getMissingProofs(jId);
          if (missing.fr.length > 0) {
            proofsMap.set(jId, missing.fr);
          }
        }
        if (proofsMap.size > 0) {
          p +=
            "Vous devrez fournir ces documents/preuves supplémentaires si vous choisissez les métiers suivants :\n";
          for (const [jId, proofs] of proofsMap.entries()) {
            p +=
              `- Pour ${jId} - ${this.getJobLinkMarkup(jId, true, false)} : ` +
              proofs.join(", ") +
              "\n";
          }
          p += "\n";
        }
      }

      // Officers
      if (listOFF.length > 0) {
        p += "Officiers :\n";
        for (const jId of listOFF) {
          p += `- ${jId} - ${this.getJobLinkMarkup(jId, true, false)}\n`;
        }
        p += "\n";

        const proofsMap = new Map<string, string[]>();
        for (const jId of listOFF) {
          const missing = this.getMissingProofs(jId);
          if (missing.fr.length > 0) {
            proofsMap.set(jId, missing.fr);
          }
        }
        if (proofsMap.size > 0) {
          p +=
            "Vous devrez fournir ces documents/preuves supplémentaires si vous choisissez les métiers suivants :\n";
          for (const [jId, proofs] of proofsMap.entries()) {
            p +=
              `- Pour ${jId} - ${this.getJobLinkMarkup(jId, true, false)} : ` +
              proofs.join(", ") +
              "\n";
          }
          p += "\n";
        }
      }

      // Conclusion French
      p +=
        "\nNous vous remercions pour votre intérêt envers les Forces armées canadiennes. Veuillez nous faire part de votre décision en répondant directement à ce courriel afin de poursuivre ou de mettre à jour votre dossier.\n\n";

      // Warning French
      p +=
        "Si vous ne prenez aucune action, votre dossier sera désactivé automatiquement après 30 jours.\n\n";

      // Signature French
      p += this.sharedState.customSignatureFr() + "\n\n";

      // Divider
      p +=
        "______________________________________________________________________________\n\n";

      // ENGLISH SECTION
      p += "Hello,\n\n";

      if (this.sharedState.includeLinkedEmail()) {
        const tasksTxt = this.sharedState.taskEmailFr();
        const enParts = tasksTxt.split("Hello,");
        if (enParts.length > 1) {
          const enBodyPart = enParts[1].split("\n\nDue to the high volume");
          if (enBodyPart.length > 0 && enBodyPart[0].trim().length > 0) {
            p += enBodyPart[0].trim() + "\n\n";
          }
        }
      }

      // Intro English
      if (hasNoJobCode) {
        p +=
          "Following the analysis of your application file, we have determined that you must undergo a reorientation. Indeed, no occupation is currently selected in your file, and the processing of your application cannot continue without an occupation choice from you.\n\n";
      }

      if (realDossierIds.length > 0) {
        if (!hasNoJobCode) {
          p +=
            "Following the analysis of your application file, we have determined that you must undergo a reorientation. Here is the current status of the occupations in your file:\n";
        } else {
          p +=
            "Here is the current status of the other occupations in your file:\n";
        }
        for (const id of realDossierIds) {
          const nameEn = `${id} - ${this.getJobLinkMarkup(id, false, false)}`;
          const s = this.evaluateJobAdmissibility(id);
          let reasonEn = "";
          if (s) {
            const reasonsEnList: string[] = [];
            if (s.isJobClosed) {
              reasonsEnList.push(
                "There are no longer positions available for this occupation.",
              );
            }
            if (!s.isAgeAdmissible) {
              reasonsEnList.push(
                `Your current age does not allow you to complete the initial contract length for this occupation (${s.durationYears} years) before reaching age 60.`,
              );
            }
            if (!s.isCitizenshipAdmissible) {
              reasonsEnList.push(
                "For various reasons, this occupation is not accessible to permanent residents.",
              );
            }
            if (!s.isEducationAdmissible) {
              reasonsEnList.push(
                "Your academic level or experience does not meet the minimum requirements.",
              );
            }

            if (reasonsEnList.length > 0) {
              reasonEn = `\n    - ${reasonsEnList.join("\n    - ")}`;
            } else {
              reasonEn =
                ": Admissible (reorientation initiated for other elements).";
            }
          }
          p += `- ${nameEn}${reasonEn}\n`;
        }
        p += "\n";
      } else if (!hasNoJobCode) {
        p +=
          "Following the analysis of your application file, we have determined that your current occupational choices are currently unavailable or you do not qualify for them based on our criteria.\n\n";
      }

      // Options English
      p += "Here are the options available to you:\n\n";
      if (isOnlyClosedJobsReason) {
        p +=
          "Option 1: Retain your current occupational choices and wait for their reopening\n";
        p +=
          "You can choose to keep your current choices and wait until next April for the reopening of recruiting positions. If you select this option, your current application file will be closed and it will be your sole responsibility to contact us towards the end of next March to reactivate your process.\n\n";
        p +=
          "Option 2: Choose another occupation from the list of eligible occupations\n";
        p +=
          "You can redirect your application to other eligible occupational choices right now. Please consult the list below.\n\n";
      } else {
        p +=
          "Choose another occupation from the list of eligible occupations\n";
        p +=
          "You must redirect your application to an occupational choice for which you are eligible to continue the enrollment process. Please consult the list below.\n\n";
      }

      // Eligible Jobs English Division
      p += "--------------------------------------------------\n";
      p += "ELIGIBLE OCCUPATIONS:\n";
      p += "--------------------------------------------------\n\n";

      // NCM English
      if (listNCM.length > 0) {
        p += "Non-Commissioned Members (NCM):\n";
        for (const jId of listNCM) {
          p += `- ${jId} - ${this.getJobLinkMarkup(jId, false, false)}\n`;
        }
        p += "\n";

        const proofsMapEn = new Map<string, string[]>();
        for (const jId of listNCM) {
          const missing = this.getMissingProofs(jId);
          if (missing.en.length > 0) {
            proofsMapEn.set(jId, missing.en);
          }
        }
        if (proofsMapEn.size > 0) {
          p +=
            "You will need to provide these additional documents/proofs if you choose the following occupations:\n";
          for (const [jId, proofs] of proofsMapEn.entries()) {
            p +=
              `- For ${jId} - ${this.getJobLinkMarkup(jId, false, false)}: ` +
              proofs.join(", ") +
              "\n";
          }
          p += "\n";
        }
      }

      // Officers English
      if (listOFF.length > 0) {
        p += "Officers:\n";
        for (const jId of listOFF) {
          p += `- ${jId} - ${this.getJobLinkMarkup(jId, false, false)}\n`;
        }
        p += "\n";

        const proofsMapEn = new Map<string, string[]>();
        for (const jId of listOFF) {
          const missing = this.getMissingProofs(jId);
          if (missing.en.length > 0) {
            proofsMapEn.set(jId, missing.en);
          }
        }
        if (proofsMapEn.size > 0) {
          p +=
            "You will need to provide these additional documents/proofs if you choose the following occupations:\n";
          for (const [jId, proofs] of proofsMapEn.entries()) {
            p +=
              `- For ${jId} - ${this.getJobLinkMarkup(jId, false, false)}: ` +
              proofs.join(", ") +
              "\n";
          }
          p += "\n";
        }
      }

      // Conclusion English
      p +=
        "\nWe thank you for your interest in the Canadian Armed Forces. Please let us know your decision by replying directly to this email so that we can update your file.\n\n";

      // Warning English
      p +=
        "If you do not take any action, your file will be automatically deactivated after 30 days.\n";

      // Signature English
      p += this.sharedState.customSignatureEn() + "\n";

      return p;
    }
  }

  async copyBilingualEmail() {
    try {
      const htmlContent = this.buildBilingualEmail(true);
      const textContent = this.buildBilingualEmail(false);
      const subject = "Forces armées canadiennes/Canadian Armed Forces";

      if (navigator.clipboard && navigator.clipboard.write) {
        const typeHtml = "text/html";
        const typeText = "text/plain";

        const blobHtml = new Blob([htmlContent], { type: typeHtml });
        const blobText = new Blob([textContent], { type: typeText });

        const data = [
          new ClipboardItem({
            [typeHtml]: blobHtml,
            [typeText]: blobText,
          }),
        ];

        await navigator.clipboard.write(data);
      } else {
        await navigator.clipboard.writeText(textContent);
      }

      this.copied.set(true);
      setTimeout(() => this.copied.set(false), 2000);

      // Open email client
      const mailtoLink = `mailto:?subject=${encodeURIComponent(subject)}`;
      window.location.href = mailtoLink;
    } catch (err) {
      console.error("Failed to copy reorientation email", err);
    }
  }

  getReoContentPlainFr() {
    return this.buildBilingualEmail(false);
  }

  getReoContentPlainEn() {
    return this.buildBilingualEmail(false);
  }

  getReoContentHtmlFr() {
    return this.buildBilingualEmail(true);
  }

  getReoContentHtmlEn() {
    return this.buildBilingualEmail(true);
  }
}
