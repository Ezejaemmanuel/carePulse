import {
  FileText,
  Calendar,
  Activity,
  Bell,
  Lock,
  Moon,
} from "lucide-react";
import { motion } from "framer-motion";
import { Card, CardContent } from "@/components/ui/card";

const Features = () => {
  const features = [
    {
      icon: FileText,
      title: "Secure Medical Records",
      description:
        "End-to-end encrypted storage for all your medical documents and history.",
    },
    {
      icon: Calendar,
      title: "Appointment Scheduling",
      description:
        "Book, reschedule, and manage appointments with your healthcare providers effortlessly.",
    },
    {
      icon: Activity,
      title: "Real-time Monitoring",
      description:
        "Track vital signs and health metrics with live updates and alerts.",
    },
    {
      icon: Bell,
      title: "Smart Notifications",
      description:
        "Receive timely reminders for appointments, medications, and check-ups.",
    },
    {
      icon: Lock,
      title: "Advanced Encryption",
      description:
        "Military-grade security ensuring your health data remains private and protected.",
    },
    {
      icon: Moon,
      title: "Dark Mode Support",
      description:
        "Comfortable viewing experience with automatic theme switching.",
    },
  ];

  return (
    <section className="py-20">
      <div className="container mx-auto px-4 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center mb-16"
        >
          <h2 className="text-4xl lg:text-5xl font-bold mb-4">
            Powerful{" "}
            <span className="bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
              Features
            </span>
          </h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Everything you need for modern healthcare management in one platform
          </p>
        </motion.div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {features.map((feature, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, scale: 0.9 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              transition={{ duration: 0.4, delay: index * 0.05 }}
              whileHover={{ scale: 1.05, transition: { duration: 0.2 } }}
            >
              <Card className="h-full border hover:border-primary/50 transition-all duration-300 bg-card hover:shadow-glow">
                <CardContent className="p-6">
                  <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center mb-4">
                    <feature.icon className="w-6 h-6 text-primary" />
                  </div>
                  <h3 className="text-xl font-semibold mb-2">
                    {feature.title}
                  </h3>
                  <p className="text-muted-foreground text-sm">
                    {feature.description}
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

export default Features;
