import StaffCard, { type StaffMember } from "./StaffCard";

const featuredStaff: StaffMember[] = [
  {
    name: "Prof. Olubola Babalola",
    faculty: "Faculty of EDM",
    department: "Quantity Surveying",
    email: "obabalola@oauife.edu.ng",
    phone: "08102938950",
    status: "Professor",
    image: "https://firebasestorage.googleapis.com/v0/b/staff-directory-89ac3.appspot.com/o/users%2F1VK5ffmL5gakKZnkGBaFTyHfzo13%2Fprofile.jpg?alt=media&token=ae174067-cc3c-4689-aca8-87a0d050d851",
  },
  {
    name: "Prof. Akinfemi Osunbitan",
    faculty: "Faculty of Technology",
    department: "Agricultural Engineering",
    email: "osunbit@oauife.edu.ng",
    phone: "08036705604",
    status: "Professor",
    image: "https://firebasestorage.googleapis.com/v0/b/staff-directory-89ac3.appspot.com/o/users%2F443ofGy0wgRjUHSaU77RTWE7qZi2%2Fprofile.jpg?alt=media&token=756399db-7f89-48c7-93d2-2f4ea6997d31",
  },
  {
    name: "Prof. Emmanuel Oluyemi",
    faculty: "Faculty of Science",
    department: "Chemistry",
    email: "eoluyemi@oauife.edu.ng",
    phone: "09036187052",
    status: "Professor",
    image: "https://firebasestorage.googleapis.com/v0/b/staff-directory-89ac3.appspot.com/o/users%2F4DXf9cyVJRaP2y31D0K6fdPV69m2%2Fprofile.jpg?alt=media&token=df87e6f0-b155-4abe-bd08-8ba6564fc1c7",
  },
  {
    name: "Dr. Adeniyi Adenuga",
    faculty: "Faculty of Science",
    department: "Chemistry",
    email: "adenugaa@oauife.edu.ng",
    phone: "09029087091",
    status: "Reader",
    image: "https://firebasestorage.googleapis.com/v0/b/staff-directory-89ac3.appspot.com/o/users%2F5HdTSwbzpEPPu1yjCm3JDAgQsS23%2Fprofile.jpg?alt=media&token=8d7013f2-b6f8-407b-8ec4-96ad5d1d38cd",
  },
  {
    name: "Prof. Temitope Olomola",
    faculty: "Faculty of Science",
    department: "Chemistry",
    email: "tolomola@gmail.com",
    status: "Professor",
    image: "https://firebasestorage.googleapis.com/v0/b/staff-directory-89ac3.appspot.com/o/users%2FCJUc5dCBoUUtw9gzniBZuOGcSGJ2%2Fprofile.jpg?alt=media&token=a565c449-e1a9-44ba-8ea0-933d3479f823",
  },
  {
    name: "Prof. T. Alimi",
    faculty: "Faculty of Agriculture",
    department: "Agricultural Economics",
    email: "talimi2001@yahoo.co.uk",
    phone: "08038490116",
    status: "Professor",
    image: "https://firebasestorage.googleapis.com/v0/b/staff-directory-89ac3.appspot.com/o/users%2FGHRyZfeDZKb3epVy9FFJIuKafEW2%2Fprofile.jpg?alt=media&token=4df9d627-3c80-4ec7-835e-5c87ae170ab2",
  },
  {
    name: "Prof. Akanni Akinyemi",
    faculty: "Faculty of Social Science",
    department: "Demography & Social Statistics",
    email: "",
    status: "Professor",
    image: "https://firebasestorage.googleapis.com/v0/b/staff-directory-89ac3.appspot.com/o/users%2FlkDAGkflkcersnAv74NuBsFMmfF3%2Fprofile.jpg?alt=media&token=e0e4a6b2-f6a4-4a8b-9400-10ead9210c7e",
  },
  {
    name: "Prof. A. S. Bamire",
    faculty: "Faculty of Agriculture",
    department: "Agricultural Economics",
    status: "Professor",
    image: "https://firebasestorage.googleapis.com/v0/b/staff-directory-89ac3.appspot.com/o/users%2FvoprJE5WDBefqAfR6m0fnUyqRHA2%2Fprofile.jpg?alt=media&token=2b6b53ad-432a-4e4c-8610-ac5f9cd4eec9",
  },
];

const FeaturedStaff = () => {
  return (
    <section id="staff" className="py-20 bg-background">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-14">
          <p className="text-accent font-medium tracking-[0.2em] uppercase text-sm mb-3">
            Our People
          </p>
          <h2 className="font-display text-3xl sm:text-4xl font-bold text-foreground">
            Featured Staff
          </h2>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {featuredStaff.map((staff, i) => (
            <StaffCard key={staff.name} staff={staff} index={i} featured />
          ))}
        </div>
      </div>
    </section>
  );
};

export default FeaturedStaff;
