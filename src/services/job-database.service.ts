import { Injectable, signal, WritableSignal } from "@angular/core";
import { JOBS_DATA, JobEntry } from "./jobs-data";
import SIP_DATA from "../../SIP.json";

@Injectable({
  providedIn: "root",
})
export class JobDatabaseService {
  private jobs: JobEntry[] = [...JOBS_DATA].sort((a, b) =>
    a.id.localeCompare(b.id),
  );

  // Signal for closed jobs to make it reactive across components
  closedJobs: WritableSignal<Set<string>> = signal(new Set(SIP_DATA.closedJobs || []));

  // Date when SIP was last updated
  sipDate = signal<string>(SIP_DATA.date || "");

  // Set of permanent resident (RP) allowed jobs as per the PDF logic
  // Set of Officer Jobs
  readonly OFFICER_JOBS = new Set([
      "00178", "00179", "00180", "00181", "00182", "00183", "00184", "00185",
      "00187", "00189", "00190", "00191", "00194", "00195", "00196", "00201",
      "00204", "00207", "00213", "00225", "00227", "00228", "00234", "00282",
      "00328", "00340", "00341", "00344", "00345", "00346", "00348", "00349",
      "00350", "00353", "00355", "00357", "00358", "00360", "00373", "00377",
      "00379", "00388", "00197", "00198", "00203", "00208", "00211", "00374", 
      "00389", "00390", "00393", "00398", "00214"
  ]);
  
  isOfficerJob(jobId: string): boolean {
    return this.OFFICER_JOBS.has(jobId);
  }

  readonly RP_JOBS = new Set([
    // Métiers du rang (Rank)
    "00005",
    "00010",
    "00019",
    "00100",
    "00105",
    "00129",
    "00130",
    "00134",
    "00135",
    "00136",
    "00137",
    "00138",
    "00149",
    "00152",
    "00153",
    "00155",
    "00161",
    "00164",
    "00166",
    "00167",
    "00168",
    "00169",
    "00170",
    "00171",
    "00261",
    "00301",
    "00302",
    "00303",
    "00304",
    "00305",
    "00306",
    "00327",
    "00335",
    "00337",
    "00339",
    "00368",
    "00370",
    "00372",
    "00375",
    "00376",
    "00386",
    "00387",
    "00402",
    "00404",
    "00405",
    "00406",
    "00407",
    // Officiers (Officers)
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
  ]);

  // Set of Canadian Citizen (CC) only jobs as per the PDF logic
  readonly CC_JOBS = new Set([
    // Métiers du rang (Rank)
    "00099",
    "00109",
    "00114",
    "00115",
    "00120",
    "00238",
    "00299",
    "00324",
    "00366",
    "00378",
    "00383",
    "00384",
    "00385",
    // Officiers (Officers)
    "00204",
    "00207",
    "00213",
    "00214",
    "00340",
    "00341",
    "00344",
  ]);

  constructor() {}

  isJobRp(jobId: string): boolean {
    return this.RP_JOBS.has(jobId);
  }

  getJobStatusTags(jobId: string): ("CC" | "RP")[] {
    if (this.RP_JOBS.has(jobId)) {
      return ["CC", "RP"];
    } else {
      return ["CC"];
    }
  }

  isJobClosed(jobId: string): boolean {
    return this.closedJobs().has(jobId);
  }

  searchJobs(query: string): JobEntry[] {
    if (!query || query.trim() === "") {
      return this.jobs;
    }

    let searchString = query.toLowerCase().trim();
    let mathResolvedId: string | null = null;

    // Check if the query is a mathematical expression (only digits, operators, spaces)
    if (/^[\d\s+\-*/()]+$/.test(searchString)) {
      try {
        // Safe evaluation
        const result = new Function(`return ${searchString}`)();
        if (
          typeof result === "number" &&
          Number.isFinite(result) &&
          result >= 0
        ) {
          mathResolvedId = result.toString().padStart(5, "0");
        }
      } catch (e) {
        // Ignore math evaluation errors
      }
    }

    // Split query into terms
    let searchTerms = searchString.split(/\s+/);

    // Aliases mapping for common specific requests
    const aliases: { [key: string]: string[] } = {
      "officier des transmissions": ["transmissions"],
      "officier de la logistique": ["logistique"],
      "officier blindé": ["blindés", "blindes"],
      "officier d'infanterie": ["infanterie"],
      "officier du génie": ["génie", "genie"],
    };

    for (const [key, mapping] of Object.entries(aliases)) {
      if (searchString.includes(key)) {
        searchTerms.push(...mapping);
      }
    }

    // Ignore common words to loosen the search, including 'officier' to prevent it from filtering out jobs without 'officier' in the title
    const ignoreWords = new Set([
      "des",
      "de",
      "la",
      "le",
      "les",
      "d",
      "l",
      "un",
      "une",
      "et",
      "en",
      "officier",
      "d'",
    ]);
    const significantTerms = searchTerms.filter((t) => !ignoreWords.has(t));

    // Fallback if all terms were ignored
    const finalTerms =
      significantTerms.length > 0 ? significantTerms : searchTerms;

    return this.jobs.filter((job) => {
      // 1. Math exact match
      if (mathResolvedId && job.id === mathResolvedId) {
        return true;
      }

      // 2. Term-based matching
      const jobTextStrict =
        `${job.id} ${job.title} ${job.abbreviation}`.toLowerCase();
      const jobTextLoose =
        `${job.id} ${job.title} ${job.abbreviation} ${job.requirements}`.toLowerCase();

      // We want to make sure EVERY significant term is present in the jobText
      // Except for the math exact expression itself which won't be in the text like "5+5",
      // but if we had mathResolvedId, it would have returned true above unless it was a partial match.
      // If it's a math expression and we didn't return true, let's just make it check if the expression string is in the text (e.g. maybe literally "10").

      // Remove the raw math expression from terms if it was resolved to avoid failing the text search
      const termsToCheck = finalTerms.filter(
        (term) => !/^[\d\s+\-*/()]+$/.test(term) || !mathResolvedId,
      );

      if (termsToCheck.length === 0 && mathResolvedId) {
        // It was purely a math expression, and it didn't match the exact ID above.
        // Maybe it matches partially?
        return (
          job.id.includes(mathResolvedId.replace(/^0+/, "")) ||
          jobTextStrict.includes(Number(mathResolvedId).toString())
        );
      }

      // Instead of failing strict, require it in strict unless they type a really weird word.
      // Easiest fix for "trop permissive" is to just use jobTextStrict
      return termsToCheck.every((term) => jobTextStrict.includes(term));
    });
  }

  getAllJobs(): JobEntry[] {
    return this.jobs;
  }
}
