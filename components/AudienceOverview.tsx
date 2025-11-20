import { Shield, Stethoscope, Users } from "lucide-react";
import { motion } from "framer-motion";
import { Card, CardContent } from "@/components/ui/card";

const AudienceOverview = () => {
  const audiences = [
    {
      icon: Shield,
      title: "For Admins",
      description:
        "Comprehensive management tools to oversee operations, manage staff, monitor analytics, and ensure smooth healthcare delivery.",
      color: "text-primary",
    },
    {
      icon: Stethoscope,
      title: "For Doctors",
      description:
        "Access patient records, schedule appointments, prescribe medications, and provide quality care with intuitive digital tools.",
      color: "text-accent",
    },
    {
      icon: Users,
      title: "For Patients",
      description:
        "Book appointments, view medical history, receive prescriptions, and communicate with healthcare providers seamlessly.",
      color: "text-primary-light",
    },
  ];

  return (
    <section className="py-20 bg-muted/30">
      <div className="container mx-auto px-4 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center mb-16"
        >
          <h2 className="text-4xl lg:text-5xl font-bold mb-4">
            Built For{" "}
            <span className="bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
              Everyone
            </span>
          </h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Our platform caters to all stakeholders in the healthcare ecosystem
          </p>
        </motion.div>

        <div className="grid md:grid-cols-3 gap-8">
          {audiences.map((audience, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
              whileHover={{ y: -10, transition: { duration: 0.2 } }}
            >
              <Card className="h-full border-2 hover:border-primary/50 transition-all duration-300 shadow-lg hover:shadow-glow bg-card">
                <CardContent className="p-8">
                  <div
                    className={`w-16 h-16 rounded-xl gradient-primary flex items-center justify-center mb-6 shadow-glow`}
                  >
                    <audience.icon className="w-8 h-8 text-white" />
                  </div>
                  <h3 className="text-2xl font-bold mb-4">{audience.title}</h3>
                  <p className="text-muted-foreground leading-relaxed">
                    {audience.description}
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

export default AudienceOverview;
