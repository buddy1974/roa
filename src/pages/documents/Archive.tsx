import { useState, useMemo } from "react";
import { Link } from "react-router-dom";
import documentsData from "../../data/documents.json";
import { type Document } from "../../components/documents/DocumentCard";
import { RouteMeta } from "../../components/seo/RouteMeta";
import { siteUrl } from "../../lib/env";

const documents = documentsData.documents as Document[];

const Archive = () => {
  const [query, setQuery] = useState("");
  const [category, setCategory] = useState("all");
  const [year, setYear] = useState("all");
  const [sort, setSort] = useState("newest");

  const filteredDocuments = useMemo(() => {
    return documents
      .filter((doc) => {
        const matchesQuery =
          doc.title.toLowerCase().includes(query.toLowerCase());

        const matchesCategory =
          category === "all" || doc.category === category;

        const matchesYear =
          year === "all" || doc.year === year;

        return matchesQuery && matchesCategory && matchesYear;
      })
      .sort((a, b) => {
        if (sort === "newest") {
          return Number(b.year) - Number(a.year);
        } else {
          return Number(a.year) - Number(b.year);
        }
      });
  }, [query, category, year, sort]);

  const categories = [...new Set(documents.map((d) => d.category))];
  const years = [...new Set(documents.map((d) => d.year).filter(Boolean))];

  return (
    <div className="container py-12">
      <RouteMeta
        title="Document Archive — Republic of Ambazonia"
        description="Search and filter the complete institutional document archive of the Federal Republic of Ambazonia."
        canonical={`${siteUrl}/documents/archive`}
      />
      <h1 className="text-3xl font-bold mb-6">Document Archive</h1>

      <div className="flex gap-4 mb-6">
        <input
          type="text"
          placeholder="Search documents..."
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          className="border p-2"
        />

        <select value={category} onChange={(e) => setCategory(e.target.value)}>
          <option value="all">All Categories</option>
          {categories.map((cat) => (
            <option key={cat} value={cat}>
              {cat}
            </option>
          ))}
        </select>

        <select value={year} onChange={(e) => setYear(e.target.value)}>
          <option value="all">All Years</option>
          {years.map((yr) => (
            <option key={yr} value={yr ?? ""}>
              {yr}
            </option>
          ))}
        </select>

        <select value={sort} onChange={(e) => setSort(e.target.value)}>
          <option value="newest">Newest → Oldest</option>
          <option value="oldest">Oldest → Newest</option>
        </select>
      </div>

      <div className="space-y-4">
        {filteredDocuments.length === 0 ? (
          <p>No documents match current filters</p>
        ) : (
          filteredDocuments.map((doc) => (
            <div key={doc.id} className="border p-4">
              <h3 className="font-semibold">{doc.title}</h3>
              <p className="text-sm text-gray-500">
                {doc.year} · {doc.category}
              </p>
              <Link
                to={`/documents/${doc.id}`}
                className="text-blue-600 underline"
              >
                Download
              </Link>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default Archive;
