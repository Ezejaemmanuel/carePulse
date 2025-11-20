import { Heart, Smile, Baby, Stethoscope, Users } from "lucide-react";
import { motion } from "framer-motion";
import { Card, CardContent } from "@/components/ui/card";

const Departments = () => {
  const departments = [
    {
      icon: Heart,
      name: "Cardiology",
      description: "Heart and cardiovascular care",
      color: "bg-red-500/10 text-red-500 dark:bg-red-500/20",
    },
    {
      icon: Smile,
      name: "Dermatology",
      description: "Skin health specialists",
      color: "bg-orange-500/10 text-orange-500 dark:bg-orange-500/20",
    },
    {
      icon: Baby,
      name: "Gynecology",
      description: "Women's health services",
      color: "bg-pink-500/10 text-pink-500 dark:bg-pink-500/20",
    },
    {
      icon: Users,
      name: "Pediatrics",
      description: "Children's healthcare",
      color: "bg-blue-500/10 text-blue-500 dark:bg-blue-500/20",
    },
    {
      icon: Stethoscope,
      name: "General Medicine",
      description: "Comprehensive primary care",
      color: "bg-primary/10 text-primary",
    },
  ];

  return (
    <section id="departments" className="py-20 bg-muted/30">
      <div className="container mx-auto px-4 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center mb-16"
        >
          <h2 className="text-4xl lg:text-5xl font-bold mb-4">
            Our{" "}
            <span className="bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
              Departments
            </span>
          </h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Specialized care across multiple medical disciplines
          </p>
        </motion.div>

        <div className="grid sm:grid-cols-2 lg:grid-cols-5 gap-6">
          {departments.map((dept, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
              whileHover={{ y: -10, transition: { duration: 0.2 } }}
            >
              <Card className="h-full text-center border hover:border-primary/50 transition-all duration-300 hover:shadow-glow bg-card">
                <CardContent className="p-6">
                  <div
                    className={`w-16 h-16 rounded-full ${dept.color} flex items-center justify-center mx-auto mb-4`}
                  >
                    <dept.icon className="w-8 h-8" />
                  </div>
                  <h3 className="text-lg font-semibold mb-2">{dept.name}</h3>
                  <p className="text-sm text-muted-foreground">
                    {dept.description}
                  </p>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default Departments;
