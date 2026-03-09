import { useState, useMemo, useEffect } from "react";
import { useSearchParams } from "react-router-dom";
import { Search, Filter, X, ChevronLeft, ChevronRight, Users } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import StaffCard from "@/components/StaffCard";
import { Skeleton } from "@/components/ui/skeleton";
import { useStaff, useFaculties, useDepartments, useRanks } from "@/hooks/useStaff";

const ITEMS_PER_PAGE = 12;

const StaffList = () => {
  const [searchParams] = useSearchParams();
  const initialQuery = searchParams.get("q") || "";
  const initialFilter = searchParams.get("filter") || "";

  const [search, setSearch] = useState(
    !initialFilter || initialFilter === "all" || initialFilter === "name" || initialFilter === "email" || initialFilter === "rank" || initialFilter === "interest" ? initialQuery : ""
  );
  const [facultyFilter, setFacultyFilter] = useState(
    initialFilter === "faculty" ? initialQuery : searchParams.get("faculty") || ""
  );
  const [departmentFilter, setDepartmentFilter] = useState(
    initialFilter === "department" ? initialQuery : ""
  );
  const [rankFilter, setRankFilter] = useState("");
  const [page, setPage] = useState(1);
  const [showFilters, setShowFilters] = useState(
    !!searchParams.get("faculty") || initialFilter === "faculty" || initialFilter === "department"
  );

  const { data: allStaff = [], isLoading } = useStaff();
  const { data: faculties = [] } = useFaculties();
  const { data: departments = [] } = useDepartments();
  const { data: ranks = [] } = useRanks();

  const filteredStaff = useMemo(() => {
    const searchLower = search.toLowerCase();
    return allStaff.filter((staff) => {
      const matchesSearch =
        !search ||
        staff.name.toLowerCase().includes(searchLower) ||
        staff.department.toLowerCase().includes(searchLower) ||
        staff.faculty.toLowerCase().includes(searchLower) ||
        (staff.email?.toLowerCase().includes(searchLower) ?? false) ||
        (staff.status?.toLowerCase().includes(searchLower) ?? false) ||
        (staff.research_interests?.some(i => i.toLowerCase().includes(searchLower)) ?? false);

      const matchesFaculty = !facultyFilter || staff.faculty === facultyFilter;
      const matchesDepartment = !departmentFilter || staff.department === departmentFilter;
      const matchesRank = !rankFilter || staff.status === rankFilter;

      return matchesSearch && matchesFaculty && matchesDepartment && matchesRank;
    });
  }, [allStaff, search, facultyFilter, departmentFilter, rankFilter]);

  const totalPages = Math.max(1, Math.ceil(filteredStaff.length / ITEMS_PER_PAGE));
  const currentPage = Math.min(page, totalPages);
  const paginatedStaff = filteredStaff.slice(
    (currentPage - 1) * ITEMS_PER_PAGE,
    currentPage * ITEMS_PER_PAGE
  );

  const activeFilterCount = [facultyFilter, departmentFilter, rankFilter].filter(Boolean).length;

  const clearFilters = () => {
    setFacultyFilter("");
    setDepartmentFilter("");
    setRankFilter("");
    setSearch("");
    setPage(1);
  };

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />

      {/* Header */}
      <section className="pt-24 pb-10 bg-primary">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <p className="text-accent font-medium tracking-[0.2em] uppercase text-sm mb-2">
            Directory
          </p>
          <h1 className="font-display text-3xl sm:text-4xl font-bold text-primary-foreground mb-6">
            Staff List
          </h1>

          <div className="flex flex-col sm:flex-row gap-3 max-w-2xl">
            <div className="relative flex-1">
              <Search size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-primary-foreground/40" />
              <input
                type="text"
                value={search}
                onChange={(e) => { setSearch(e.target.value); setPage(1); }}
                placeholder="Search by name, department, or faculty..."
                className="w-full bg-primary-foreground/10 backdrop-blur-md border border-primary-foreground/20 text-primary-foreground placeholder:text-primary-foreground/40 rounded-lg pl-11 pr-4 py-3 text-sm font-body focus:outline-none focus:ring-2 focus:ring-accent"
              />
            </div>
            <button
              onClick={() => setShowFilters(!showFilters)}
              className="flex items-center justify-center gap-2 bg-primary-foreground/10 border border-primary-foreground/20 text-primary-foreground rounded-lg px-5 py-3 text-sm font-medium hover:bg-primary-foreground/20 transition-colors"
            >
              <Filter size={16} />
              Filters
              {activeFilterCount > 0 && (
                <span className="bg-accent text-accent-foreground text-xs font-bold w-5 h-5 rounded-full flex items-center justify-center">
                  {activeFilterCount}
                </span>
              )}
            </button>
          </div>

          <AnimatePresence>
            {showFilters && (
              <motion.div
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: "auto", opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                transition={{ duration: 0.2 }}
                className="overflow-hidden"
              >
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mt-4 max-w-2xl">
                  <select
                    value={facultyFilter}
                    onChange={(e) => { setFacultyFilter(e.target.value); setPage(1); }}
                    className="bg-primary-foreground/10 border border-primary-foreground/20 text-primary-foreground rounded-lg px-4 py-2.5 text-sm font-body focus:outline-none focus:ring-2 focus:ring-accent"
                  >
                    <option value="" className="text-foreground">All Faculties</option>
                    {faculties.map((f) => (
                      <option key={f} value={f} className="text-foreground">{f}</option>
                    ))}
                  </select>

                  <select
                    value={departmentFilter}
                    onChange={(e) => { setDepartmentFilter(e.target.value); setPage(1); }}
                    className="bg-primary-foreground/10 border border-primary-foreground/20 text-primary-foreground rounded-lg px-4 py-2.5 text-sm font-body focus:outline-none focus:ring-2 focus:ring-accent"
                  >
                    <option value="" className="text-foreground">All Departments</option>
                    {departments.map((d) => (
                      <option key={d} value={d} className="text-foreground">{d}</option>
                    ))}
                  </select>

                  <select
                    value={rankFilter}
                    onChange={(e) => { setRankFilter(e.target.value); setPage(1); }}
                    className="bg-primary-foreground/10 border border-primary-foreground/20 text-primary-foreground rounded-lg px-4 py-2.5 text-sm font-body focus:outline-none focus:ring-2 focus:ring-accent"
                  >
                    <option value="" className="text-foreground">All Ranks</option>
                    {ranks.map((r) => (
                      <option key={r} value={r} className="text-foreground">{r}</option>
                    ))}
                  </select>
                </div>

                {activeFilterCount > 0 && (
                  <button
                    onClick={clearFilters}
                    className="mt-3 flex items-center gap-1.5 text-accent hover:text-accent/80 text-sm transition-colors"
                  >
                    <X size={14} />
                    Clear all filters
                  </button>
                )}
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </section>

      {/* Results */}
      <section className="flex-1 py-10 bg-background">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between mb-8">
            <div className="flex items-center gap-2 text-muted-foreground text-sm">
              <Users size={16} />
              <span>
                Showing{" "}
                <span className="font-semibold text-foreground">{filteredStaff.length}</span>{" "}
                staff member{filteredStaff.length !== 1 ? "s" : ""}
              </span>
            </div>
            <p className="text-muted-foreground text-sm">
              Page {currentPage} of {totalPages}
            </p>
          </div>

          {isLoading ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {Array.from({ length: 8 }).map((_, i) => (
                <div key={i} className="bg-card rounded-xl border border-border overflow-hidden">
                  <Skeleton className="h-48 w-full" />
                  <div className="p-5 space-y-2">
                    <Skeleton className="h-5 w-3/4" />
                    <Skeleton className="h-4 w-1/2" />
                    <Skeleton className="h-4 w-2/3" />
                  </div>
                </div>
              ))}
            </div>
          ) : paginatedStaff.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {paginatedStaff.map((staff, i) => (
                <StaffCard key={staff.name + i} staff={staff} index={i} />
              ))}
            </div>
          ) : (
            <div className="text-center py-20">
              <Users size={48} className="mx-auto text-muted-foreground/30 mb-4" />
              <h3 className="font-display text-xl font-semibold text-foreground mb-2">
                No staff found
              </h3>
              <p className="text-muted-foreground text-sm mb-4">
                Try adjusting your search or filters
              </p>
              <button onClick={clearFilters} className="text-accent hover:text-accent/80 text-sm font-medium transition-colors">
                Clear all filters
              </button>
            </div>
          )}

          {totalPages > 1 && (
            <div className="flex items-center justify-center gap-2 mt-12">
              <button
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                disabled={currentPage === 1}
                className="flex items-center gap-1 px-4 py-2 rounded-lg border border-border text-sm font-medium text-foreground hover:bg-muted disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
              >
                <ChevronLeft size={16} /> Previous
              </button>
              <div className="flex items-center gap-1">
                {Array.from({ length: totalPages }, (_, i) => i + 1).map((p) => (
                  <button
                    key={p}
                    onClick={() => setPage(p)}
                    className={`w-9 h-9 rounded-lg text-sm font-medium transition-colors ${
                      p === currentPage ? "bg-primary text-primary-foreground" : "text-foreground hover:bg-muted"
                    }`}
                  >
                    {p}
                  </button>
                ))}
              </div>
              <button
                onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                disabled={currentPage === totalPages}
                className="flex items-center gap-1 px-4 py-2 rounded-lg border border-border text-sm font-medium text-foreground hover:bg-muted disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
              >
                Next <ChevronRight size={16} />
              </button>
            </div>
          )}
        </div>
      </section>

      <Footer />
    </div>
  );
};

export default StaffList;
