import { motion } from "framer-motion";
import { Link } from "wouter";
import { FileText, ArrowLeft } from "lucide-react";
import { Navigation } from "@/components/navigation";
import { VideoHeader } from "@/components/video-header";
import { Footer } from "@/components/footer";

export default function TermsOfService() {
  return (
    <div className="min-h-screen bg-black text-white">
      <Navigation />
      <VideoHeader 
        title="Terms of Service" 
        subtitle="Membership agreement and terms for Miami Beach Yacht Club"
      >
        {/* Stats Cards */}
        <div className="flex flex-wrap justify-center gap-6 mt-12">
          <div className="bg-white/10 backdrop-blur-sm border border-white/20 rounded-2xl p-6 text-center">
            <FileText className="w-8 h-8 text-purple-400 mx-auto mb-3" />
            <div className="text-2xl font-bold text-white">Legal</div>
            <div className="text-sm text-gray-400">Binding Agreement</div>
          </div>
          <div className="bg-white/10 backdrop-blur-sm border border-white/20 rounded-2xl p-6 text-center">
            <div className="text-2xl font-bold text-white">12 Month</div>
            <div className="text-sm text-gray-400">Minimum Term</div>
          </div>
          <div className="bg-white/10 backdrop-blur-sm border border-white/20 rounded-2xl p-6 text-center">
            <div className="text-2xl font-bold text-white">US Coast Guard</div>
            <div className="text-sm text-gray-400">Compliant</div>
          </div>
        </div>
      </VideoHeader>

      {/* Main Content */}
      <div className="relative z-10 -mt-32 pb-16">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 1.0 }}
            className="bg-gray-900/80 backdrop-blur-md border border-gray-700/50 rounded-3xl p-8 md:p-12"
          >
            {/* Content */}
            <div className="prose prose-invert prose-purple max-w-none">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.3 }}
                className="space-y-8"
              >
                {/* Introduction */}
                <section>
                  <p className="text-gray-300 text-lg leading-relaxed">
                    MBYC offers a membership program with attached schedules and rules and regulations. Members participate in this exclusive yacht club experience under the following terms and conditions.
                  </p>
                </section>

                {/* Membership */}
                <section>
                  <h2 className="text-2xl font-bold text-white mb-4 flex items-center gap-3">
                    <span className="w-2 h-8 bg-gradient-to-b from-purple-400 to-indigo-400 rounded-full"></span>
                    Membership Access
                  </h2>
                  <p className="text-gray-300 leading-relaxed">
                    MBYC shall provide access to yachts from the MBYC fleet on an availability basis at the applicable member rates then in effect. Such rates, however, shall be subject to change by MBYC when deemed necessary although not during any term hereunder with respect to this Agreement with the Member.
                  </p>
                </section>

                {/* Member Responsibilities */}
                <section>
                  <h2 className="text-2xl font-bold text-white mb-4 flex items-center gap-3">
                    <span className="w-2 h-8 bg-gradient-to-b from-purple-400 to-indigo-400 rounded-full"></span>
                    Member Responsibilities
                  </h2>
                  <p className="text-gray-300 leading-relaxed">
                    Members are not responsible for operating the yachts and will have a professional captain on board and will in all cases defer to the captain of the yacht. Members agree not to damage the yacht through their gross negligence, negligence or while under the influence of alcohol or drugs; this provision also applies to every family member and guest of the Member on the yacht.
                  </p>
                </section>

                {/* Yacht Condition and Maintenance */}
                <section>
                  <h2 className="text-2xl font-bold text-white mb-4 flex items-center gap-3">
                    <span className="w-2 h-8 bg-gradient-to-b from-purple-400 to-indigo-400 rounded-full"></span>
                    Yacht Condition and Maintenance
                  </h2>
                  <p className="text-gray-300 leading-relaxed">
                    Members agree to return any yacht used in an outing by the Member or its family to MBYC in at least in the same condition as at the beginning of an outing, accounting for normal wear and tear. Prompt reporting of any damage to the yacht or its equipment is mandatory, ensuring timely resolution by MBYC.
                  </p>
                </section>

                {/* Initiation Fee and Membership Dues */}
                <section>
                  <h2 className="text-2xl font-bold text-white mb-4 flex items-center gap-3">
                    <span className="w-2 h-8 bg-gradient-to-b from-purple-400 to-indigo-400 rounded-full"></span>
                    Initiation Fee and Membership Dues
                  </h2>
                  <p className="text-gray-300 leading-relaxed mb-4">
                    The Initiation Fee shall be due and payable as of the date of this Agreement and is non-refundable. The first installment of monthly or quarterly Membership Dues or the pre-payment of the Annual Membership Dues up front, as applicable, shall be due and payable as of the date of this Agreement.
                  </p>
                  <p className="text-gray-300 leading-relaxed">
                    The term of this Agreement shall be for a minimum period of 12 months from the Effective Date, at which time this agreement shall renew automatically for successive one-year terms unless terminated by either party with 30 days written notice.
                  </p>
                </section>

                {/* Safety and Compliance */}
                <section>
                  <h2 className="text-2xl font-bold text-white mb-4 flex items-center gap-3">
                    <span className="w-2 h-8 bg-gradient-to-b from-purple-400 to-indigo-400 rounded-full"></span>
                    Safety and Compliance
                  </h2>
                  <p className="text-gray-300 leading-relaxed mb-4">
                    Member agrees to adhere to all safety guidelines provided by MBYC and that all yachts provided by MBYC will be used in strict compliance with all applicable federal, state, and local regulations as promulgated by the Department of Transportation, Miami-Dade County, United States Coast Guard, United States Customs and all other governmental bodies.
                  </p>
                  <p className="text-gray-300 leading-relaxed">
                    Member agrees that each yacht provided by MBYC will be used exclusively for recreational purposes and will not be used for any illegal purpose or in any illegal manner.
                  </p>
                </section>

                {/* Insurance and Indemnity */}
                <section>
                  <h2 className="text-2xl font-bold text-white mb-4 flex items-center gap-3">
                    <span className="w-2 h-8 bg-gradient-to-b from-purple-400 to-indigo-400 rounded-full"></span>
                    Insurance and Indemnity
                  </h2>
                  <p className="text-gray-300 leading-relaxed mb-4">
                    Member agrees to comply with all conditions to coverage of any yacht provided by MBYC. In the event of any damage involving any yacht provided by MBYC, Member agrees to furnish MBYC with a complete report of the same immediately in writing.
                  </p>
                  <p className="text-gray-300 leading-relaxed">
                    Member shall be liable to MBYC for any liability, loss, or damage caused or incurred in connection with the operation of any yacht provided by MBYC if said liability, loss, or damage is not covered by any applicable insurance. Member also agrees immediately on demand to pay to MBYC the amount of any deductible for any damage covered, but not paid in full, by insurance.
                  </p>
                </section>

                {/* Waiver and Release */}
                <section>
                  <h2 className="text-2xl font-bold text-white mb-4 flex items-center gap-3">
                    <span className="w-2 h-8 bg-gradient-to-b from-purple-400 to-indigo-400 rounded-full"></span>
                    Waiver and Release for Yachting Activities
                  </h2>
                  <p className="text-gray-300 leading-relaxed">
                    The member recognizes that engaging in yachting activities includes inherent risks. Those risks include a broad range of things that can happen while on board a yacht, such as accidents, weather, collisions, or injuries. Member chooses to participate in this activity despite those risks. Member, therefore, agrees to assume all risks that may occur in connection with these activities resulting in any harm, damages, injury, illness, or death.
                  </p>
                </section>

                {/* Membership Plans */}
                <section>
                  <h2 className="text-2xl font-bold text-white mb-6 flex items-center gap-3">
                    <span className="w-2 h-8 bg-gradient-to-b from-purple-400 to-indigo-400 rounded-full"></span>
                    MBYC Membership Plans
                  </h2>
                  
                  {/* Gold Membership */}
                  <div className="bg-gradient-to-r from-yellow-600/20 to-yellow-500/20 border border-yellow-500/30 rounded-xl p-6 mb-6">
                    <h3 className="text-xl font-bold text-yellow-400 mb-4">Gold Membership</h3>
                    <ul className="text-gray-300 space-y-2">
                      <li>• Annual Membership Dues: $60,000 (Monthly: $5,000, Quarterly: $15,000)</li>
                      <li>• Yacht Access: Up to including 74 ft</li>
                      <li>• Initiation Fee: $25,000 (one-time)</li>
                      <li>• Up to four (4) bookings at once: two (2) on weekends, two (2) on weekdays</li>
                    </ul>
                  </div>

                  {/* Platinum Membership */}
                  <div className="bg-gradient-to-r from-gray-400/20 to-gray-300/20 border border-gray-400/30 rounded-xl p-6 mb-6">
                    <h3 className="text-xl font-bold text-gray-300 mb-4">Platinum Membership</h3>
                    <ul className="text-gray-300 space-y-2">
                      <li>• Annual Membership Dues: $90,000 (Monthly: $7,500, Quarterly: $22,500)</li>
                      <li>• Yacht Access: Up to and including 84 ft</li>
                      <li>• Initiation Fee: $50,000 (one-time)</li>
                      <li>• Eight (8) concurrent reservations: four (4) on weekends, two (2) on weekdays per week</li>
                      <li>• Includes priority booking and yacht upgrade requests</li>
                    </ul>
                  </div>

                  {/* Diamond Membership */}
                  <div className="bg-gradient-to-r from-purple-600/20 to-indigo-600/20 border border-purple-500/30 rounded-xl p-6 mb-6">
                    <h3 className="text-xl font-bold text-purple-400 mb-4">Diamond Membership</h3>
                    <ul className="text-gray-300 space-y-2">
                      <li>• Annual Membership Dues: $120,000 (Monthly: $10,000, Quarterly: $30,000)</li>
                      <li>• Yacht Access: Up to and including 100 ft</li>
                      <li>• Initiation Fee: $100,000 (one-time)</li>
                      <li>• Twelve (12) concurrent reservations: six (6) on weekends, three (3) on weekdays</li>
                      <li>• Full day booking available: one (1) per week on weekdays only</li>
                      <li>• Maximum five (5) booking slots per week</li>
                    </ul>
                  </div>
                </section>

                {/* Rules and Regulations */}
                <section>
                  <h2 className="text-2xl font-bold text-white mb-4 flex items-center gap-3">
                    <span className="w-2 h-8 bg-gradient-to-b from-purple-400 to-indigo-400 rounded-full"></span>
                    Rules and Regulations
                  </h2>
                  <div className="space-y-4">
                    <div>
                      <h4 className="text-lg font-semibold text-purple-400 mb-2">Payment and Disputes</h4>
                      <p className="text-gray-300 leading-relaxed">
                        All Membership Dues, or other fees or charges, must be paid in full before departure. Club members will not be permitted to sail with an outstanding balance, or if a matter is under dispute.
                      </p>
                    </div>
                    <div>
                      <h4 className="text-lg font-semibold text-purple-400 mb-2">Cancellation Policy</h4>
                      <p className="text-gray-300 leading-relaxed">
                        A 24-hour notice is required for cancellations or changes to boat reservations. Insufficient cancellation notice may result in a $1000 cancellation fee. Members may cancel within 24 hours without penalty due to forecasted rain.
                      </p>
                    </div>
                    <div>
                      <h4 className="text-lg font-semibold text-purple-400 mb-2">Captain Authority</h4>
                      <p className="text-gray-300 leading-relaxed">
                        A professional Captain will be required for all yacht outings. The captain shall be appropriately licensed, qualified, and knowledgeable. Members must defer to the captain's authority at all times.
                      </p>
                    </div>
                  </div>
                </section>

                {/* Contact Information */}
                <section className="mt-12 pt-8 border-t border-gray-700">
                  <h2 className="text-2xl font-bold text-white mb-4 flex items-center gap-3">
                    <span className="w-2 h-8 bg-gradient-to-b from-purple-400 to-indigo-400 rounded-full"></span>
                    Questions about these Terms?
                  </h2>
                  <p className="text-gray-300 leading-relaxed">
                    If you have any questions about these Terms of Service or our membership agreements, please contact Miami Beach Yacht Club through our website's contact form or reach out to our member services team.
                  </p>
                  <div className="mt-6">
                    <Link 
                      href="/" 
                      className="inline-flex items-center gap-2 bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 px-6 py-3 rounded-xl text-white font-semibold transition-all duration-300 transform hover:scale-105"
                    >
                      <ArrowLeft className="w-5 h-5" />
                      Return to Home
                    </Link>
                  </div>
                </section>
              </motion.div>
            </div>
          </motion.div>
        </div>
      </div>

      <Footer />
    </div>
  );
}